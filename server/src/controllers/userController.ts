import { Response } from 'express';
import { User, UserRole, AccountStatus } from '../models/User';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, role, department, status, page = 1, limit = 10 } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { department: searchRegex }];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const recentBookings = await Booking.find({ user: user._id })
      .populate('resource', 'name category location')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      user,
      recentBookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, department, designation, accountStatus } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const previousRole = user.role;
    const previousStatus = user.accountStatus;

    if (role && ['student', 'faculty', 'staff', 'admin'].includes(role)) {
      user.role = role as UserRole;
    }

    if (department) user.department = department.trim();
    if (designation !== undefined) user.designation = designation.trim();

    if (accountStatus && ['active', 'inactive', 'suspended'].includes(accountStatus)) {
      user.accountStatus = accountStatus as AccountStatus;
    }

    await user.save();

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `Updated user ${user.email}: role (${previousRole} -> ${user.role}), status (${previousStatus} -> ${user.accountStatus})`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        designation: user.designation,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Prevent admin from deactivating themselves
    if (req.user && req.user._id.toString() === user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active administrator account.',
      });
      return;
    }

    user.accountStatus = user.accountStatus === 'active' ? 'inactive' : 'active';
    await user.save();

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `Toggled user ${user.email} status to ${user.accountStatus}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.accountStatus}`,
      accountStatus: user.accountStatus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
