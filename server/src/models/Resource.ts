import mongoose, { Document, Schema } from 'mongoose';

export type ResourceCategory =
  | 'seminar_hall'
  | 'classroom'
  | 'computer_lab'
  | 'science_lab'
  | 'auditorium'
  | 'meeting_room'
  | 'projector'
  | 'av_equipment'
  | 'other';

export interface IResourceLocation {
  building: string;
  floor: string;
  roomNumber: string;
}

export interface IOperatingHours {
  open: string; // e.g. "08:00"
  close: string; // e.g. "20:00"
}

export interface IBookingRestrictions {
  maxDurationHours: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  allowWeekends: boolean;
}

export interface IMaintenanceStatus {
  isUnderMaintenance: boolean;
  reason?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IResource extends Document {
  name: string;
  category: ResourceCategory;
  description: string;
  location: IResourceLocation;
  capacity: number;
  facilities: string[];
  operatingHours: IOperatingHours;
  bookingRestrictions: IBookingRestrictions;
  bufferMinutes: number; // buffer between reservations
  maintenanceStatus: IMaintenanceStatus;
  isActive: boolean;
  imageUrl: string;
  departmentScope?: string; // Optional: specific department or 'all'
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: [
        'seminar_hall',
        'classroom',
        'computer_lab',
        'science_lab',
        'auditorium',
        'meeting_room',
        'projector',
        'av_equipment',
        'other',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
    },
    location: {
      building: { type: String, required: true, trim: true },
      floor: { type: String, required: true, trim: true },
      roomNumber: { type: String, required: true, trim: true },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' },
    },
    bookingRestrictions: {
      maxDurationHours: { type: Number, default: 8 },
      minNoticeHours: { type: Number, default: 2 },
      maxAdvanceDays: { type: Number, default: 60 },
      allowWeekends: { type: Boolean, default: true },
    },
    bufferMinutes: {
      type: Number,
      default: 15, // 15-minute cleaning/turnaround buffer
    },
    maintenanceStatus: {
      isUnderMaintenance: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    departmentScope: {
      type: String,
      default: 'all',
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for fast search and availability lookups
ResourceSchema.index({ category: 1, isActive: 1 });
ResourceSchema.index({ 'location.building': 1 });

export const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
