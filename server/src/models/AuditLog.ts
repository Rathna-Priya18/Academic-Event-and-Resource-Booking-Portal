import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'USER_STATUS_CHANGE'
  | 'RESOURCE_CREATE'
  | 'RESOURCE_UPDATE'
  | 'RESOURCE_DELETE'
  | 'RESOURCE_MAINTENANCE_TOGGLE'
  | 'BOOKING_CREATE'
  | 'BOOKING_APPROVE'
  | 'BOOKING_REJECT'
  | 'BOOKING_CANCEL'
  | 'EVENT_CREATE'
  | 'EVENT_UPDATE'
  | 'EVENT_DELETE'
  | 'PASSWORD_RESET';

export interface IAuditLog extends Document {
  actor?: mongoose.Types.ObjectId;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  entityType: 'User' | 'Resource' | 'Booking' | 'Event' | 'System';
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      required: true,
      default: 'system',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['User', 'Resource', 'Booking', 'Event', 'System'],
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
