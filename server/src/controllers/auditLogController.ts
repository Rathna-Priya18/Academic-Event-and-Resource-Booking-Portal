import { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { action, entityType, page = 1, limit = 25, search } = req.query;

    const query: any = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      query.$or = [{ description: regex }, { actorEmail: regex }, { entityId: regex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    const distinctActions = await AuditLog.distinct('action');

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        actions: distinctActions,
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
