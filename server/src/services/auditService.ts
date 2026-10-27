import mongoose from 'mongoose';
import { AuditLog, AuditAction } from '../models/AuditLog';

export async function logAuditEvent(params: {
  actor?: mongoose.Types.ObjectId;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  entityType: 'User' | 'Resource' | 'Booking' | 'Event' | 'System';
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    return await AuditLog.create({
      actor: params.actor,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || '',
      description: params.description,
      metadata: params.metadata || {},
      ipAddress: params.ipAddress || '',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
