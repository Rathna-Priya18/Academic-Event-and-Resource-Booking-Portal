import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Resource } from '../server/src/models/Resource';
import { Booking } from '../server/src/models/Booking';
import { User } from '../server/src/models/User';
import {
  validateBookingRules,
  checkBookingConflict,
  atomicallyApproveBooking,
} from '../server/src/services/conflictEngine';

let mongoServer: MongoMemoryServer;
let testUser: any;
let adminUser: any;
let testResource: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  adminUser = await User.create({
    name: 'Admin Test',
    email: 'admin.test@academic.edu',
    password: 'Password@123',
    department: 'Administration',
    role: 'admin',
    accountStatus: 'active',
  });

  testUser = await User.create({
    name: 'Faculty Test',
    email: 'faculty.test@academic.edu',
    password: 'Password@123',
    department: 'Computer Science',
    role: 'faculty',
    accountStatus: 'active',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Resource.deleteMany({});

  testResource = await Resource.create({
    name: 'Test Seminar Hall A',
    category: 'seminar_hall',
    description: 'High-tech amphitheater for test validations',
    location: { building: 'Science Wing', floor: '1st', roomNumber: '101' },
    capacity: 100,
    facilities: ['Projector', 'Audio'],
    operatingHours: { open: '08:00', close: '20:00' },
    bookingRestrictions: { maxDurationHours: 6, minNoticeHours: 2, maxAdvanceDays: 60, allowWeekends: true },
    bufferMinutes: 15,
    maintenanceStatus: { isUnderMaintenance: false },
    isActive: true,
  });
});

describe('Core Booking Conflict Prevention Engine', () => {
  it('Rule 1: should reject booking if start time is after or equal to end time', async () => {
    const start = new Date('2026-11-10T12:00:00Z');
    const end = new Date('2026-11-10T10:00:00Z');

    const result = await validateBookingRules(testResource, start, end, 50, { allowPastForSeed: true });
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('INVALID_TIME_RANGE');
  });

  it('Rule 2: should reject bookings exceeding resource maximum capacity', async () => {
    const start = new Date('2026-11-10T10:00:00Z');
    const end = new Date('2026-11-10T12:00:00Z');

    const result = await validateBookingRules(testResource, start, end, 150, { allowPastForSeed: true });
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('EXCEEDS_CAPACITY');
  });

  it('Rule 3: should reject bookings outside resource operating hours', async () => {
    // Resource closes at 20:00 (8:00 PM). Booking until 22:00 (10:00 PM)
    const start = new Date();
    start.setDate(start.getDate() + 5);
    start.setHours(19, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 5);
    end.setHours(22, 0, 0, 0);

    const result = await validateBookingRules(testResource, start, end, 30);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('OUTSIDE_OPERATING_HOURS');
  });

  it('Rule 4: should reject bookings during scheduled maintenance periods', async () => {
    const maintStart = new Date();
    maintStart.setDate(maintStart.getDate() + 3);
    maintStart.setHours(8, 0, 0, 0);

    const maintEnd = new Date();
    maintEnd.setDate(maintEnd.getDate() + 4);
    maintEnd.setHours(18, 0, 0, 0);

    testResource.maintenanceStatus = {
      isUnderMaintenance: true,
      reason: 'Acoustic Ceiling Overhaul',
      startDate: maintStart,
      endDate: maintEnd,
    };
    await testResource.save();

    const bookingStart = new Date(maintStart.getTime() + 3600000 * 2);
    const bookingEnd = new Date(bookingStart.getTime() + 3600000 * 3);

    const result = await validateBookingRules(testResource, bookingStart, bookingEnd, 25);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('RESOURCE_IN_MAINTENANCE');
  });

  it('Rule 5: should detect overlapping approved bookings using Half-Open Interval rule', async () => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 10);

    const slotA_start = new Date(baseDate);
    slotA_start.setHours(10, 0, 0, 0);
    const slotA_end = new Date(baseDate);
    slotA_end.setHours(12, 0, 0, 0);

    // Existing approved booking: 10:00 to 12:00
    await Booking.create({
      bookingRef: 'BK-TEST-001',
      user: testUser._id,
      resource: testResource._id,
      eventTitle: 'Approved Keynote',
      purpose: 'Keynote Lecture',
      department: 'Computer Science',
      startDateTime: slotA_start,
      endDateTime: slotA_end,
      expectedAttendees: 60,
      status: 'approved',
    });

    // Overlapping request: 11:00 to 13:00 (overlaps by 1 hour)
    const slotB_start = new Date(baseDate);
    slotB_start.setHours(11, 0, 0, 0);
    const slotB_end = new Date(baseDate);
    slotB_end.setHours(13, 0, 0, 0);

    const conflictResult = await checkBookingConflict(testResource._id, slotB_start, slotB_end);
    expect(conflictResult.hasConflict).toBe(true);
    expect(conflictResult.conflictingBooking?.bookingRef).toBe('BK-TEST-001');
  });

  it('Rule 6: should permit adjacent bookings when changeover buffer is zero or respected', async () => {
    // Disable buffer for pure adjacent testing
    testResource.bufferMinutes = 0;
    await testResource.save();

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 12);

    const slotA_start = new Date(baseDate);
    slotA_start.setHours(10, 0, 0, 0);
    const slotA_end = new Date(baseDate);
    slotA_end.setHours(12, 0, 0, 0);

    await Booking.create({
      bookingRef: 'BK-TEST-002',
      user: testUser._id,
      resource: testResource._id,
      eventTitle: 'Morning Session',
      purpose: 'Morning Session',
      department: 'Computer Science',
      startDateTime: slotA_start,
      endDateTime: slotA_end,
      expectedAttendees: 40,
      status: 'approved',
    });

    // Immediately adjacent slot: exactly 12:00 to 14:00 (endA == startB)
    const slotB_start = new Date(baseDate);
    slotB_start.setHours(12, 0, 0, 0);
    const slotB_end = new Date(baseDate);
    slotB_end.setHours(14, 0, 0, 0);

    const conflictResult = await checkBookingConflict(testResource._id, slotB_start, slotB_end, undefined, false);
    expect(conflictResult.hasConflict).toBe(false);
  });

  it('Rule 7: cancelled or rejected bookings must NOT block availability', async () => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 14);

    const slotStart = new Date(baseDate);
    slotStart.setHours(14, 0, 0, 0);
    const slotEnd = new Date(baseDate);
    slotEnd.setHours(16, 0, 0, 0);

    // Cancelled booking in the same slot
    await Booking.create({
      bookingRef: 'BK-TEST-CANCELLED',
      user: testUser._id,
      resource: testResource._id,
      eventTitle: 'Cancelled Workshop',
      purpose: 'Cancelled',
      department: 'Computer Science',
      startDateTime: slotStart,
      endDateTime: slotEnd,
      expectedAttendees: 30,
      status: 'cancelled',
    });

    const check = await checkBookingConflict(testResource._id, slotStart, slotEnd);
    expect(check.hasConflict).toBe(false);
  });

  it('Rule 8: atomic approval prevents double-approval for concurrent overlapping requests', async () => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 16);

    const slotStart = new Date(baseDate);
    slotStart.setHours(10, 0, 0, 0);
    const slotEnd = new Date(baseDate);
    slotEnd.setHours(12, 0, 0, 0);

    // Request 1
    const req1 = await Booking.create({
      bookingRef: 'BK-REQ-1',
      user: testUser._id,
      resource: testResource._id,
      eventTitle: 'First Request',
      purpose: 'Research Seminar',
      department: 'Computer Science',
      startDateTime: slotStart,
      endDateTime: slotEnd,
      expectedAttendees: 50,
      status: 'pending',
    });

    // Request 2 (identical time slot)
    const req2 = await Booking.create({
      bookingRef: 'BK-REQ-2',
      user: testUser._id,
      resource: testResource._id,
      eventTitle: 'Second Conflicting Request',
      purpose: 'Department Meeting',
      department: 'Mathematics',
      startDateTime: slotStart,
      endDateTime: slotEnd,
      expectedAttendees: 40,
      status: 'pending',
    });

    // Approve Request 1 first
    const approve1 = await atomicallyApproveBooking(req1._id, adminUser._id);
    expect(approve1.success).toBe(true);
    expect(approve1.booking?.status).toBe('approved');

    // Attempt to approve Request 2: MUST fail atomically!
    const approve2 = await atomicallyApproveBooking(req2._id, adminUser._id);
    expect(approve2.success).toBe(false);
    expect(approve2.error).toBeDefined();
    expect(approve2.error).toContain('Schedule conflict');
  });
});
