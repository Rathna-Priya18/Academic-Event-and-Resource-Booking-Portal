export type UserRole = 'student' | 'faculty' | 'staff' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface IUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  designation?: string;
  phone?: string;
  accountStatus: AccountStatus;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

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
  open: string;
  close: string;
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
  startDate?: string;
  endDate?: string;
}

export interface IResource {
  _id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  location: IResourceLocation;
  capacity: number;
  facilities: string[];
  operatingHours: IOperatingHours;
  bookingRestrictions: IBookingRestrictions;
  bufferMinutes: number;
  maintenanceStatus: IMaintenanceStatus;
  isActive: boolean;
  imageUrl: string;
  departmentScope?: string;
  createdAt: string;
  updatedAt: string;
}

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
  changedBy: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  timestamp: string;
  note?: string;
}

export interface IBooking {
  _id: string;
  bookingRef: string;
  user: IUser | string;
  resource: IResource | string;
  eventTitle: string;
  purpose: string;
  department: string;
  eventCategory: EventCategory;
  startDateTime: string;
  endDateTime: string;
  expectedAttendees: number;
  contactPhone?: string;
  specialRequirements?: string;
  status: BookingStatus;
  approvalDetails?: {
    approvedBy?: {
      _id: string;
      name: string;
      designation?: string;
    } | string;
    approvedAt?: string;
    remarks?: string;
  };
  rejectionReason?: string;
  cancellationDetails?: {
    cancelledBy?: string;
    cancelledAt?: string;
    reason?: string;
  };
  statusHistory: IStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  organizer: string;
  department: string;
  category: string;
  startDateTime: string;
  endDateTime: string;
  resource?: IResource | string;
  booking?: IBooking | string;
  isPublished: boolean;
  bannerUrl?: string;
  targetAudience: string;
  maxParticipants?: number;
  tags: string[];
  createdAt: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  relatedBooking?: string;
  relatedEvent?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actor?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: 'User' | 'Resource' | 'Booking' | 'Event' | 'System';
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
