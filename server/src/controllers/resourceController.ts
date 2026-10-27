import { Request, Response } from 'express';
import { Resource } from '../models/Resource';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';

export async function getResources(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      category,
      building,
      minCapacity,
      activeOnly = 'false',
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (building && building !== 'all') {
      query['location.building'] = building;
    }

    if (minCapacity) {
      query.capacity = { $gte: parseInt(String(minCapacity), 10) || 1 };
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { 'location.building': searchRegex },
        { 'location.roomNumber': searchRegex },
        { facilities: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(query).sort({ category: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
      Resource.countDocuments(query),
    ]);

    // Extract unique buildings and categories for quick filtering in UI
    const [buildings, categories] = await Promise.all([
      Resource.distinct('location.building'),
      Resource.distinct('category'),
    ]);

    res.status(200).json({
      success: true,
      data: resources,
      meta: {
        buildings,
        categories,
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

export async function getResourceById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Get upcoming approved bookings for preview
    const now = new Date();
    const upcomingBookings = await Booking.find({
      resource: resource._id,
      status: 'approved',
      startDateTime: { $gte: now },
    })
      .select('bookingRef eventTitle startDateTime endDateTime department eventCategory')
      .sort({ startDateTime: 1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      resource,
      upcomingBookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getResourceAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    let rangeStart: Date;
    let rangeEnd: Date;

    if (startDate && endDate) {
      rangeStart = new Date(String(startDate));
      rangeEnd = new Date(String(endDate));
    } else if (date) {
      rangeStart = new Date(String(date));
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeStart = new Date();
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart.getTime() + 7 * 24 * 3600 * 1000);
    }

    // Fetch approved bookings within the range
    const approvedBookings = await Booking.find({
      resource: resource._id,
      status: 'approved',
      startDateTime: { $lt: rangeEnd },
      endDateTime: { $gt: rangeStart },
    })
      .select('bookingRef eventTitle startDateTime endDateTime department status eventCategory')
      .sort({ startDateTime: 1 })
      .lean();

    // Also fetch pending bookings so users can see existing requests
    const pendingBookings = await Booking.find({
      resource: resource._id,
      status: 'pending',
      startDateTime: { $lt: rangeEnd },
      endDateTime: { $gt: rangeStart },
    })
      .select('bookingRef eventTitle startDateTime endDateTime department status eventCategory')
      .sort({ startDateTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      resource: {
        id: resource._id,
        name: resource.name,
        category: resource.category,
        operatingHours: resource.operatingHours,
        bufferMinutes: resource.bufferMinutes,
        maintenanceStatus: resource.maintenanceStatus,
        isActive: resource.isActive,
      },
      range: {
        start: rangeStart,
        end: rangeEnd,
      },
      approvedBookings,
      pendingBookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      category,
      description,
      location,
      capacity,
      facilities,
      operatingHours,
      bookingRestrictions,
      bufferMinutes,
      imageUrl,
      departmentScope,
    } = req.body;

    if (!name || !category || !description || !location || !capacity) {
      res.status(400).json({
        success: false,
        message: 'Name, category, description, location, and capacity are mandatory fields.',
      });
      return;
    }

    const resource = await Resource.create({
      name: name.trim(),
      category,
      description: description.trim(),
      location: {
        building: location.building?.trim() || 'Main Academic Block',
        floor: location.floor?.trim() || '1st Floor',
        roomNumber: location.roomNumber?.trim() || '101',
      },
      capacity: Number(capacity),
      facilities: Array.isArray(facilities) ? facilities : [],
      operatingHours: operatingHours || { open: '08:00', close: '20:00' },
      bookingRestrictions: bookingRestrictions || {
        maxDurationHours: 8,
        minNoticeHours: 2,
        maxAdvanceDays: 60,
        allowWeekends: true,
      },
      bufferMinutes: bufferMinutes !== undefined ? Number(bufferMinutes) : 15,
      imageUrl: imageUrl || '',
      departmentScope: departmentScope || 'all',
      isActive: true,
    });

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'RESOURCE_CREATE',
      entityType: 'Resource',
      entityId: resource._id.toString(),
      description: `Created resource "${resource.name}" in category ${resource.category}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully.',
      resource,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    const fieldsToUpdate = [
      'name',
      'category',
      'description',
      'location',
      'capacity',
      'facilities',
      'operatingHours',
      'bookingRestrictions',
      'bufferMinutes',
      'imageUrl',
      'departmentScope',
      'isActive',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    await resource.save();

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'RESOURCE_UPDATE',
      entityType: 'Resource',
      entityId: resource._id.toString(),
      description: `Updated resource details for "${resource.name}"`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      resource,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleMaintenance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { isUnderMaintenance, reason, startDate, endDate } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    resource.maintenanceStatus = {
      isUnderMaintenance: Boolean(isUnderMaintenance),
      reason: reason || '',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    await resource.save();

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'RESOURCE_MAINTENANCE_TOGGLE',
      entityType: 'Resource',
      entityId: resource._id.toString(),
      description: `Maintenance status for "${resource.name}" set to ${isUnderMaintenance ? 'ACTIVE (Under Maintenance)' : 'CLEAR'}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Resource maintenance status updated to: ${isUnderMaintenance ? 'Under Maintenance' : 'Available'}`,
      maintenanceStatus: resource.maintenanceStatus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Safety rule from specs: Prevent deletion or deactivation from silently invalidating existing approved reservations!
    const activeBookingsCount = await Booking.countDocuments({
      resource: resource._id,
      status: 'approved',
      startDateTime: { $gte: new Date() },
    });

    if (activeBookingsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete this resource because there are ${activeBookingsCount} upcoming approved bookings scheduled. Please reassign or cancel those bookings first, or deactivate the resource instead.`,
      });
      return;
    }

    await Resource.findByIdAndDelete(id);

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'RESOURCE_DELETE',
      entityType: 'Resource',
      entityId: id,
      description: `Deleted resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Resource removed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
