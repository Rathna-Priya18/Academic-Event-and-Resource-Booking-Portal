import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

export async function createNotification(params: {
  recipient: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedBooking?: string | mongoose.Types.ObjectId;
  relatedEvent?: string | mongoose.Types.ObjectId;
  actionUrl?: string;
}) {
  try {
    return await Notification.create({
      recipient: params.recipient,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedBooking: params.relatedBooking,
      relatedEvent: params.relatedEvent,
      actionUrl: params.actionUrl || '',
      isRead: false,
    });
  } catch (error) {
    console.error('Failed to create persistent notification:', error);
    return null;
  }
}
