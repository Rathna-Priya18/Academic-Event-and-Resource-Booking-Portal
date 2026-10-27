import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: string;
  department: string;
  category: string;
  startDateTime: Date;
  endDateTime: Date;
  resource?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  isPublished: boolean;
  bannerUrl?: string;
  targetAudience: string; // 'All Campus', 'Students', 'Faculty', 'Departmental', etc.
  maxParticipants?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Academic',
    },
    startDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      default: 'All Campus',
    },
    maxParticipants: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
