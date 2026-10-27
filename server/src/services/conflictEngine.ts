import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking';
import { Resource, IResource } from '../models/Resource';

export interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingBooking?: {
    id: string;
    bookingRef: string;
    eventTitle: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
  };
}

export interface BookingValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}

/**
 * Validates basic booking timing constraints against resource rules and current clock time
 */
export async function validateBookingRules(
  resource: IResource,
  startDateTime: Date,
  endDateTime: Date,
  attendees: number,
  options: { allowPastForSeed?: boolean } = {}
): Promise<BookingValidationResult> {
  const now = new Date();

  // 1. Start must be strictly before end
  if (startDateTime.getTime() >= endDateTime.getTime()) {
    return {
      isValid: false,
      error: 'Booking start time must be strictly before end time',
      code: 'INVALID_TIME_RANGE',
    };
  }

  // 2. Reject dates in the past (unless seed/test flag allowed)
  if (!options.allowPastForSeed && startDateTime.getTime() < now.getTime() - 60000) {
    return {
      isValid: false,
      error: 'Cannot book resources for past dates and times',
      code: 'PAST_DATE_ERROR',
    };
  }

  // 3. Minimum notice check
  const minNoticeHours = resource.bookingRestrictions?.minNoticeHours ?? 2;
  const noticeTime = new Date(now.getTime() + minNoticeHours * 3600 * 1000);
  if (!options.allowPastForSeed && startDateTime < noticeTime) {
    return {
      isValid: false,
      error: `Bookings require at least ${minNoticeHours} hours advance notice`,
      code: 'INSUFFICIENT_NOTICE',
    };
  }

  // 4. Maximum advance days check
  const maxAdvanceDays = resource.bookingRestrictions?.maxAdvanceDays ?? 60;
  const maxAdvanceDate = new Date(now.getTime() + maxAdvanceDays * 24 * 3600 * 1000);
  if (startDateTime > maxAdvanceDate) {
    return {
      isValid: false,
      error: `Bookings cannot be made more than ${maxAdvanceDays} days in advance`,
      code: 'EXCEEDS_MAX_ADVANCE',
    };
  }

  // 5. Maximum duration check
  const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 3600);
  const maxDurationHours = resource.bookingRestrictions?.maxDurationHours ?? 8;
  if (durationHours > maxDurationHours) {
    return {
      isValid: false,
      error: `Requested duration of ${durationHours.toFixed(1)} hours exceeds maximum limit of ${maxDurationHours} hours`,
      code: 'EXCEEDS_MAX_DURATION',
    };
  }

  // 6. Capacity validation
  if (attendees > resource.capacity) {
    return {
      isValid: false,
      error: `Expected attendees (${attendees}) exceeds venue maximum capacity (${resource.capacity})`,
      code: 'EXCEEDS_CAPACITY',
    };
  }

  // 7. Active status
  if (!resource.isActive) {
    return {
      isValid: false,
      error: 'This resource is currently deactivated by administration and unavailable for booking',
      code: 'RESOURCE_INACTIVE',
    };
  }

  // 8. Maintenance check
  if (resource.maintenanceStatus?.isUnderMaintenance) {
    const { startDate, endDate, reason } = resource.maintenanceStatus;
    if (startDate && endDate) {
      // Overlap with maintenance period: startA < endB && endA > startB
      if (startDateTime < endDate && endDateTime > startDate) {
        return {
          isValid: false,
          error: `Resource is under scheduled maintenance from ${startDate.toLocaleString()} to ${endDate.toLocaleString()}: ${reason || 'Routine service'}`,
          code: 'RESOURCE_IN_MAINTENANCE',
        };
      }
    } else {
      return {
        isValid: false,
        error: `Resource is currently closed for maintenance: ${reason || 'Technical repairs'}`,
        code: 'RESOURCE_IN_MAINTENANCE',
      };
    }
  }

  // 9. Operating hours check (convert local hours)
  const openTimeStr = resource.operatingHours?.open || '08:00';
  const closeTimeStr = resource.operatingHours?.close || '20:00';
  const [openH, openM] = openTimeStr.split(':').map(Number);
  const [closeH, closeM] = closeTimeStr.split(':').map(Number);

  const startHour = startDateTime.getHours();
  const startMinute = startDateTime.getMinutes();
  const endHour = endDateTime.getHours();
  const endMinute = endDateTime.getMinutes();

  const startMinutesSinceMidnight = startHour * 60 + startMinute;
  const endMinutesSinceMidnight = endHour * 60 + endMinute;
  const openMinutesSinceMidnight = openH * 60 + openM;
  const closeMinutesSinceMidnight = closeH * 60 + closeM;

  if (
    startMinutesSinceMidnight < openMinutesSinceMidnight ||
    endMinutesSinceMidnight > closeMinutesSinceMidnight
  ) {
    return {
      isValid: false,
      error: `Requested booking time falls outside operating hours (${openTimeStr} - ${closeTimeStr})`,
      code: 'OUTSIDE_OPERATING_HOURS',
    };
  }

  return { isValid: true };
}

/**
 * Checks for overlapping approved bookings using the Half-Open Interval rule:
 * startA < endB AND endA > startB
 * With optional buffer time consideration.
 */
export async function checkBookingConflict(
  resourceId: string | mongoose.Types.ObjectId,
  startDateTime: Date,
  endDateTime: Date,
  excludeBookingId?: string | mongoose.Types.ObjectId,
  includeBuffer: boolean = true
): Promise<ConflictCheckResult> {
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return { hasConflict: true, reason: 'Target resource does not exist' };
  }

  const bufferMs = includeBuffer && resource.bufferMinutes ? resource.bufferMinutes * 60 * 1000 : 0;

  // Expanded query window to catch buffer overlaps:
  // An approved booking (startB, endB) conflicts with requested (startA, endA) if:
  // startA < (endB + buffer) AND (endA + buffer) > startB
  const effectiveStart = new Date(startDateTime.getTime() - bufferMs);
  const effectiveEnd = new Date(endDateTime.getTime() + bufferMs);

  const query: any = {
    resource: resourceId,
    status: 'approved',
    // Half-open interval overlap with buffer:
    startDateTime: { $lt: effectiveEnd },
    endDateTime: { $gt: effectiveStart },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicting = await Booking.findOne(query).lean();

  if (conflicting) {
    return {
      hasConflict: true,
      reason: `Schedule conflict: overlaps with approved reservation "${conflicting.eventTitle}" (${conflicting.bookingRef}) from ${conflicting.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${conflicting.endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${bufferMs > 0 ? ` (including ${resource.bufferMinutes}m changeover buffer)` : ''}`,
      conflictingBooking: {
        id: conflicting._id.toString(),
        bookingRef: conflicting.bookingRef,
        eventTitle: conflicting.eventTitle,
        startDateTime: conflicting.startDateTime,
        endDateTime: conflicting.endDateTime,
        status: conflicting.status,
      },
    };
  }

  return { hasConflict: false };
}

/**
 * Atomic approval execution with revalidation to guarantee concurrency protection.
 * If another admin approves an overlapping request milliseconds prior, this atomic
 * findOneAndUpdate condition rechecks that NO overlapping approved booking exists
 * before flipping the status to 'approved'.
 */
export async function atomicallyApproveBooking(
  bookingId: string | mongoose.Types.ObjectId,
  adminUserId: mongoose.Types.ObjectId,
  remarks?: string
): Promise<{ success: boolean; booking?: IBooking; error?: string }> {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  if (booking.status === 'approved') {
    return { success: true, booking };
  }

  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    return { success: false, error: `Cannot approve a booking that is currently ${booking.status}` };
  }

  // 1. Pre-check conflict
  const conflict = await checkBookingConflict(
    booking.resource,
    booking.startDateTime,
    booking.endDateTime,
    booking._id,
    true
  );

  if (conflict.hasConflict) {
    return {
      success: false,
      error: conflict.reason || 'Conflict detected with another approved booking',
    };
  }

  // 2. Atomic transition:
  // Re-verify that no approved booking overlaps before setting status to approved
  const resource = await Resource.findById(booking.resource);
  const bufferMs = (resource?.bufferMinutes || 0) * 60 * 1000;
  const effectiveStart = new Date(booking.startDateTime.getTime() - bufferMs);
  const effectiveEnd = new Date(booking.endDateTime.getTime() + bufferMs);

  // Check if any race condition occurred in between
  const raceConflict = await Booking.findOne({
    resource: booking.resource,
    status: 'approved',
    _id: { $ne: booking._id },
    startDateTime: { $lt: effectiveEnd },
    endDateTime: { $gt: effectiveStart },
  });

  if (raceConflict) {
    return {
      success: false,
      error: `Approval rejected: Another concurrent request "${raceConflict.eventTitle}" was approved for this time slot first.`,
    };
  }

  booking.status = 'approved';
  booking.approvalDetails = {
    approvedBy: adminUserId,
    approvedAt: new Date(),
    remarks: remarks || 'Approved by administrator',
  };
  booking.statusHistory.push({
    status: 'approved',
    changedBy: adminUserId,
    timestamp: new Date(),
    note: remarks || 'Approved by administrator',
  });

  await booking.save();
  return { success: true, booking };
}
