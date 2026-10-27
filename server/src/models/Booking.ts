import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type EventCategory =
  | 'seminar'
  | 'workshop'
  | 'lecture'
  | 'lab_session'
  | 'conference'
  | 'cultural'
  | 'student_club'
  | 'meeting'
  | 'examination'
  | 'other';

export interface IStatusHistoryItem {
  status: BookingStatus;
  changedBy: mongoose.Types.ObjectId;
  timestamp: Date;
  note?: string;
}

export interface IBooking extends Document {
  bookingRef: string;
  user: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  eventTitle: string;
  purpose: string;
  department: string;
  eventCategory: EventCategory;
  startDateTime: Date;
  endDateTime: Date;
  expectedAttendees: number;
  contactPhone?: string;
  specialRequirements?: string;
  status: BookingStatus;
  approvalDetails?: {
    approvedBy: mongoose.Types.ObjectId;
    approvedAt: Date;
    remarks?: string;
  };
  rejectionReason?: string;
  cancellationDetails?: {
    cancelledBy: mongoose.Types.ObjectId;
    cancelledAt: Date;
    reason: string;
  };
  statusHistory: IStatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true,
    },
    eventTitle: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    purpose: {
      type: String,
      required: [true, 'Event purpose is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    eventCategory: {
      type: String,
      required: true,
      enum: [
        'seminar',
        'workshop',
        'lecture',
        'lab_session',
        'conference',
        'cultural',
        'student_club',
        'meeting',
        'examination',
        'other',
      ],
      default: 'seminar',
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required'],
      index: true,
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
      index: true,
    },
    expectedAttendees: {
      type: Number,
      required: [true, 'Expected attendees count is required'],
      min: [1, 'Attendees must be at least 1'],
    },
    contactPhone: {
      type: String,
      default: '',
    },
    specialRequirements: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    approvalDetails: {
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      remarks: { type: String, default: '' },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationDetails: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
      cancelledAt: { type: Date },
      reason: { type: String, default: '' },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// High performance index for conflict detection query:
BookingSchema.index({ resource: 1, status: 1, startDateTime: 1, endDateTime: 1 });
BookingSchema.index({ user: 1, createdAt: -1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
