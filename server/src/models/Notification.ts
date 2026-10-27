import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'booking_submitted'
  | 'booking_approved'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'maintenance_alert'
  | 'event_published'
  | 'system_notice';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedBooking?: mongoose.Types.ObjectId;
  relatedEvent?: mongoose.Types.ObjectId;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'booking_submitted',
        'booking_approved',
        'booking_rejected',
        'booking_cancelled',
        'maintenance_alert',
        'event_published',
        'system_notice',
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedEvent: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
