import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Resource } from '../models/Resource';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import {
  validateBookingRules,
  checkBookingConflict,
  atomicallyApproveBooking,
} from '../services/conflictEngine';
import { createNotification } from '../services/notificationService';
import { logAuditEvent } from '../services/auditService';

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${year}-${random}`;
}

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      resourceId,
      eventTitle,
      purpose,
      department,
      eventCategory,
      startDateTime,
      endDateTime,
      expectedAttendees,
      contactPhone,
      specialRequirements,
    } = req.body;

    if (!resourceId || !eventTitle || !purpose || !startDateTime || !endDateTime || !expectedAttendees) {
      res.status(400).json({
        success: false,
        message: 'Resource, event title, purpose, start time, end time, and expected attendees are required.',
      });
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
      return;
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Requested resource not found.' });
      return;
    }

    // 1. Validate rules (notice, advance limit, operating hours, capacity, maintenance)
    const ruleCheck = await validateBookingRules(resource, start, end, Number(expectedAttendees));
    if (!ruleCheck.isValid) {
      res.status(400).json({
        success: false,
        message: ruleCheck.error,
        code: ruleCheck.code,
      });
      return;
    }

    // 2. Check for overlapping approved reservations
    const conflict = await checkBookingConflict(resource._id, start, end, undefined, true);
    if (conflict.hasConflict) {
      res.status(409).json({
        success: false,
        message: conflict.reason || 'This time slot conflicts with an existing approved booking.',
        conflictingBooking: conflict.conflictingBooking,
      });
      return;
    }

    let bookingRef = generateBookingReference();
    let collisionCheck = await Booking.findOne({ bookingRef });
    while (collisionCheck) {
      bookingRef = generateBookingReference();
      collisionCheck = await Booking.findOne({ bookingRef });
    }

    const booking = await Booking.create({
      bookingRef,
      user: req.user._id,
      resource: resource._id,
      eventTitle: eventTitle.trim(),
      purpose: purpose.trim(),
      department: department?.trim() || req.user.department,
      eventCategory: eventCategory || 'seminar',
      startDateTime: start,
      endDateTime: end,
      expectedAttendees: Number(expectedAttendees),
      contactPhone: contactPhone || req.user.phone || '',
      specialRequirements: specialRequirements || '',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user._id,
          timestamp: new Date(),
          note: 'Booking request submitted by requester',
        },
      ],
    });

    // Populate for clean response
    await booking.populate('resource', 'name category location capacity imageUrl');

    // Persistent notifications
    await createNotification({
      recipient: req.user._id,
      type: 'booking_submitted',
      title: 'Booking Request Received',
      message: `Your booking request ${bookingRef} for "${resource.name}" has been submitted for administrative review.`,
      relatedBooking: booking._id,
      actionUrl: `/bookings/${booking._id}`,
    });

    // Notify institutional administrators
    const admins = await User.find({ role: 'admin', accountStatus: 'active' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'booking_submitted',
        title: 'New Booking Awaiting Approval',
        message: `${req.user.name} (${req.user.department}) requested "${resource.name}" for "${booking.eventTitle}" (${bookingRef}).`,
        relatedBooking: booking._id,
        actionUrl: `/admin/approvals`,
      });
    }

    // Audit Log
    await logAuditEvent({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOKING_CREATE',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      description: `User ${req.user.email} created booking ${bookingRef} for ${resource.name}`,
      metadata: {
        bookingRef,
        resourceName: resource.name,
        startDateTime: start,
        endDateTime: end,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully. Awaiting administrator approval.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      status,
      resourceId,
      department,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 15,
    } = req.query;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (resourceId && resourceId !== 'all') {
      query.resource = resourceId;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (startDate && endDate) {
      query.startDateTime = {
        $gte: new Date(String(startDate)),
        $lte: new Date(String(endDate)),
      };
    } else if (startDate) {
      query.startDateTime = { $gte: new Date(String(startDate)) };
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { bookingRef: searchRegex },
        { eventTitle: searchRegex },
        { purpose: searchRegex },
        { department: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email department role phone')
        .populate('resource', 'name category location capacity imageUrl bufferMinutes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('resource', 'name category location capacity imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    // Summary counts for user dashboard badges
    const [pendingCount, approvedCount, rejectedCount, cancelledCount] = await Promise.all([
      Booking.countDocuments({ user: req.user._id, status: 'pending' }),
      Booking.countDocuments({ user: req.user._id, status: 'approved' }),
      Booking.countDocuments({ user: req.user._id, status: 'rejected' }),
      Booking.countDocuments({ user: req.user._id, status: 'cancelled' }),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      counts: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        cancelled: cancelledCount,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('user', 'name email department role phone')
      .populate('resource', 'name category location capacity facilities operatingHours imageUrl')
      .populate('approvalDetails.approvedBy', 'name email designation')
      .populate('statusHistory.changedBy', 'name email role');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Authorization: User can only view their own booking unless they are an admin
    if (req.user?.role !== 'admin' && booking.user._id.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view bookings created by your account.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function approveBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only administrators can approve bookings' });
      return;
    }

    const result = await atomicallyApproveBooking(id, req.user._id, remarks);
    if (!result.success) {
      res.status(409).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const booking = result.booking!;
    await booking.populate('resource', 'name');
    await booking.populate('user', 'email name');

    // Notify user of approval
    await createNotification({
      recipient: booking.user as any,
      type: 'booking_approved',
      title: 'Booking Approved!',
      message: `Your booking request ${booking.bookingRef} for "${(booking.resource as any)?.name}" on ${new Date(booking.startDateTime).toLocaleDateString()} has been approved.`,
      relatedBooking: booking._id,
      actionUrl: `/bookings/${booking._id}`,
    });

    await logAuditEvent({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOKING_APPROVE',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      description: `Admin approved booking ${booking.bookingRef} (${booking.eventTitle})`,
      metadata: { remarks },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Booking successfully approved. Slot confirmed.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function rejectBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only administrators can reject bookings' });
      return;
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please provide a clear justification / reason for rejecting this booking request.',
      });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'Cannot reject an already cancelled booking' });
      return;
    }

    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason.trim();
    booking.statusHistory.push({
      status: 'rejected',
      changedBy: req.user._id,
      timestamp: new Date(),
      note: `Rejected by admin: ${rejectionReason.trim()}`,
    });

    await booking.save();
    await booking.populate('resource', 'name');

    // Persistent notification to requester
    await createNotification({
      recipient: booking.user,
      type: 'booking_rejected',
      title: 'Booking Request Declined',
      message: `Your booking request ${booking.bookingRef} was declined: "${rejectionReason.trim()}".`,
      relatedBooking: booking._id,
      actionUrl: `/bookings/${booking._id}`,
    });

    await logAuditEvent({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOKING_REJECT',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      description: `Admin rejected booking ${booking.bookingRef}. Reason: ${rejectionReason}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Booking request rejected. Slot released.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Ownership check: Requester or Admin can cancel
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel another user\'s booking.',
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
      return;
    }

    const cancellationReason = reason?.trim() || (isAdmin ? 'Cancelled by administration' : 'Cancelled by requester');

    booking.status = 'cancelled';
    booking.cancellationDetails = {
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      reason: cancellationReason,
    };
    booking.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user._id,
      timestamp: new Date(),
      note: cancellationReason,
    });

    await booking.save();
    await booking.populate('resource', 'name');

    // Notify other party
    if (isAdmin && !isOwner) {
      await createNotification({
        recipient: booking.user,
        type: 'booking_cancelled',
        title: 'Booking Cancelled by Administrator',
        message: `Your booking ${booking.bookingRef} has been cancelled by the administration: ${cancellationReason}`,
        relatedBooking: booking._id,
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOKING_CANCEL',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      description: `${isAdmin ? 'Admin' : 'User'} cancelled booking ${booking.bookingRef}: ${cancellationReason}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Slot is now available for other reservations.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
