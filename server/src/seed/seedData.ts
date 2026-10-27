import { User } from '../models/User';
import { Resource } from '../models/Resource';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

export async function seedDatabase(force: boolean = false): Promise<void> {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0 && !force) {
    console.log('Database already populated with initial records. Skipping auto-seed.');
    return;
  }

  console.log('Seeding comprehensive academic database records...');

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      Booking.deleteMany({}),
      Event.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
  }

  // 1. Create Users
  const adminUser = await User.create({
    name: 'Dr. Arthur Vance (Dean of Academic Affairs)',
    email: 'admin@academic.edu',
    password: 'Admin@123',
    department: 'Academic Administration',
    role: 'admin',
    designation: 'Dean of Academic Resources & Facilities',
    phone: '+1 (555) 019-4821',
    accountStatus: 'active',
  });

  const facultyCS = await User.create({
    name: 'Prof. Rajesh Sharma',
    email: 'prof.sharma@academic.edu',
    password: 'Faculty@123',
    department: 'Computer Science & Engineering',
    role: 'faculty',
    designation: 'Professor & Head of Department',
    phone: '+1 (555) 019-8234',
    accountStatus: 'active',
  });

  const facultyBio = await User.create({
    name: 'Dr. Elena Rostova',
    email: 'dr.elena@academic.edu',
    password: 'Faculty@123',
    department: 'Biotechnology & Life Sciences',
    role: 'faculty',
    designation: 'Associate Professor & Principal Investigator',
    phone: '+1 (555) 019-3321',
    accountStatus: 'active',
  });

  const studentAlex = await User.create({
    name: 'Alex Rivera (President, ACM Student Chapter)',
    email: 'student.alex@academic.edu',
    password: 'Student@123',
    department: 'Computer Science & Engineering',
    role: 'student',
    designation: 'Senior Undergraduate Scholar',
    phone: '+1 (555) 019-7412',
    accountStatus: 'active',
  });

  const studentPriya = await User.create({
    name: 'Priya Sundaram',
    email: 'student.priya@academic.edu',
    password: 'Student@123',
    department: 'Electronics & Communication',
    role: 'student',
    designation: 'Graduate Research Scholar',
    phone: '+1 (555) 019-5561',
    accountStatus: 'active',
  });

  const staffRobert = await User.create({
    name: 'Robert Hastings',
    email: 'staff.robert@academic.edu',
    password: 'Staff@123',
    department: 'Campus Media & Facilities',
    role: 'staff',
    designation: 'Chief AV & Facilities Engineer',
    phone: '+1 (555) 019-9944',
    accountStatus: 'active',
  });

  console.log('Created 6 demo user accounts across admin, faculty, student, and staff roles.');

  // 2. Create Resources (comprehensive campus venues with clean, realistic names)
  const resourcesData = [
    {
      name: 'Seminar Hall 1',
      category: 'seminar_hall',
      description:
        'State-of-the-art tiered executive seminar hall designed for keynote presentations, international symposia, doctoral defenses, and distinguished guest lectures.',
      location: { building: 'Academic Block A', floor: '1st Floor', roomNumber: 'SH-101' },
      capacity: 180,
      facilities: ['Dual 4K Laser Projection', 'Surround Sound Audio', 'Podium Microphones', 'Air Conditioning', 'High-Speed Wi-Fi', 'Live Video Streaming Rig'],
      operatingHours: { open: '08:00', close: '21:00' },
      bookingRestrictions: { maxDurationHours: 6, minNoticeHours: 4, maxAdvanceDays: 60, allowWeekends: true },
      bufferMinutes: 15,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
    },
    {
      name: 'Main Auditorium',
      category: 'auditorium',
      description:
        'Primary university auditorium featuring tiered seating, stage lighting, concert sound system, and projection facilities for campus assemblies, convocations, and guest lectures.',
      location: { building: 'Central Academic Block', floor: 'Ground Floor', roomNumber: 'AUD-01' },
      capacity: 850,
      facilities: ['Stage Sound System', 'Theatrical DMX Lighting', 'Motorized Stage Rigging', 'VIP Green Rooms', 'Central Climate Control', 'Simultaneous Translation Booths'],
      operatingHours: { open: '08:00', close: '22:00' },
      bookingRestrictions: { maxDurationHours: 10, minNoticeHours: 24, maxAdvanceDays: 90, allowWeekends: true },
      bufferMinutes: 30,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_auditorium_1793023440037.jpg',
    },
    {
      name: 'Mini Auditorium',
      category: 'auditorium',
      description:
        'Medium-sized modern auditorium equipped with acoustic wall treatments, theatre seating, and AV presentation system for departmental symposiums, guest talks, and cultural events.',
      location: { building: 'Academic Block B', floor: '1st Floor', roomNumber: 'AUD-02' },
      capacity: 250,
      facilities: ['Dual HD Laser Projectors', 'Surround Sound Audio', 'Stage Lighting', 'Air Conditioning', 'Wireless Handheld & Lapel Mics'],
      operatingHours: { open: '08:00', close: '21:00' },
      bookingRestrictions: { maxDurationHours: 6, minNoticeHours: 6, maxAdvanceDays: 60, allowWeekends: true },
      bufferMinutes: 20,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_auditorium_1793023440037.jpg',
    },
    {
      name: 'Computer Lab 1',
      category: 'computer_lab',
      description:
        'Equipped with 60 modern workstation nodes, dedicated server racks with GPU clusters, interactive digital smartboards, and gigabit fiber connectivity for deep learning and simulations.',
      location: { building: 'Innovation & Research Wing', floor: '3rd Floor', roomNumber: 'CL-304' },
      capacity: 60,
      facilities: ['Dual-Monitor Workstations', 'GPU Compute Cluster', 'Interactive Smartboard', 'Gigabit Ethernet', 'Air Conditioning', 'Anti-Static Flooring'],
      operatingHours: { open: '08:00', close: '20:00' },
      bookingRestrictions: { maxDurationHours: 4, minNoticeHours: 2, maxAdvanceDays: 30, allowWeekends: true },
      bufferMinutes: 15,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_computer_lab_1793023441272.jpg',
    },
    {
      name: 'Biotechnology Lab',
      category: 'science_lab',
      description:
        'Cleanroom-grade laboratory with certified laminar flow hoods, PCR thermocyclers, confocal microscopes, and spectrophotometers for advanced biological sciences and clinical experiments.',
      location: { building: 'Bio-Sciences Research Complex', floor: '2nd Floor', roomNumber: 'BL-208' },
      capacity: 35,
      facilities: ['Laminar Flow Clean Benches', 'Digital Confocal Microscope', 'Cold Storage -80C', 'Fume Hoods', 'Sterilization Autoclave', 'Emergency Eye-Wash Station'],
      operatingHours: { open: '08:30', close: '19:00' },
      bookingRestrictions: { maxDurationHours: 6, minNoticeHours: 6, maxAdvanceDays: 45, allowWeekends: false },
      bufferMinutes: 20,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_science_lab_1793023442000.jpg',
    },
    {
      name: 'Smart Classroom 101',
      category: 'classroom',
      description:
        'Modern collaborative learning classroom with motorized tiered desk seating, panoramic whiteboards, document camera, and dual ceiling-mounted interactive projectors.',
      location: { building: 'Humanities & Sciences Quad', floor: '2nd Floor', roomNumber: 'CR-101' },
      capacity: 90,
      facilities: ['Interactive Projectors', 'Wireless Screen Casting', 'Audio Recording System', 'Magnetic Whiteboards', 'Climate Control'],
      operatingHours: { open: '08:00', close: '18:00' },
      bookingRestrictions: { maxDurationHours: 4, minNoticeHours: 2, maxAdvanceDays: 30, allowWeekends: false },
      bufferMinutes: 10,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/hero_academic_campus_1793023440205.jpg',
    },
    {
      name: 'Conference Room A',
      category: 'meeting_room',
      description:
        'Executive conference room with ergonomic leather seating around a solid walnut boardroom table, integrated tabletop microphones, and 85-inch 4K video conferencing display.',
      location: { building: 'Central Administrative Complex', floor: '3rd Floor', roomNumber: 'ADM-310' },
      capacity: 28,
      facilities: ['85-inch 4K Video Conference Screen', 'Omnidirectional Table Microphones', 'Catering Station', 'Private Restroom', 'Wi-Fi 6E'],
      operatingHours: { open: '08:30', close: '19:30' },
      bookingRestrictions: { maxDurationHours: 5, minNoticeHours: 3, maxAdvanceDays: 45, allowWeekends: false },
      bufferMinutes: 15,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
    },
    {
      name: 'Physics Lab',
      category: 'science_lab',
      description:
        'Vibration-isolated optical research facility equipped with laser optical breadboards, interferometers, spectrometer units, and darkroom environment.',
      location: { building: 'Physical Sciences Block', floor: 'Basement Level', roomNumber: 'PL-012' },
      capacity: 25,
      facilities: ['Optical Isolation Tables', 'Spectroscopy Array', 'Laser Safety Interlocks', 'Class 10,000 Cleanroom Area', 'Nitrogen Gas Outlets'],
      operatingHours: { open: '09:00', close: '18:00' },
      bookingRestrictions: { maxDurationHours: 4, minNoticeHours: 12, maxAdvanceDays: 30, allowWeekends: false },
      bufferMinutes: 20,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_science_lab_1793023442000.jpg',
    },
    {
      name: 'Robotics Lab',
      category: 'computer_lab',
      description:
        'Maker space with high-precision 3D printers, CNC laser cutter, soldering workbenches, robot arm test arenas, and rapid prototyping materials.',
      location: { building: 'Mechanical Engineering Annex', floor: '1st Floor', roomNumber: 'RL-112' },
      capacity: 40,
      facilities: ['Stereolithography 3D Printers', 'Laser Cutting Table', 'Fume Extraction Snorkels', 'Oscilloscopes & Power Supplies', 'Robotic Test Arena'],
      operatingHours: { open: '08:00', close: '20:00' },
      bookingRestrictions: { maxDurationHours: 5, minNoticeHours: 3, maxAdvanceDays: 30, allowWeekends: true },
      bufferMinutes: 15,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_computer_lab_1793023441272.jpg',
    },
    {
      name: 'Portable Projector Kit 1',
      category: 'projector',
      description:
        'Professional 8,000 ANSI lumen 4K portable laser projector unit with motorized folding screen, wireless HDMI transmitters, and rolling flight case.',
      location: { building: 'Central Media Services', floor: 'Ground Floor', roomNumber: 'MS-Depot' },
      capacity: 250,
      facilities: ['8000 Lumen 4K Laser Projector', '150-inch Portable Screen', 'Wireless 4K Sender', 'Rolling Pelican Case'],
      operatingHours: { open: '08:00', close: '21:00' },
      bookingRestrictions: { maxDurationHours: 8, minNoticeHours: 2, maxAdvanceDays: 30, allowWeekends: true },
      bufferMinutes: 30,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/resource_auditorium_1793023440037.jpg',
    },
    {
      name: 'Meeting Room B',
      category: 'meeting_room',
      description:
        'Mid-size formal academic meeting room suitable for faculty interviews, departmental committees, accreditation audits, and research grant reviews.',
      location: { building: 'Academic Block A', floor: '2nd Floor', roomNumber: 'MR-220' },
      capacity: 18,
      facilities: ['75-inch Display', 'High-Fidelity Audio Bar', 'Glass Whiteboard', 'Espresso Refreshment Bar'],
      operatingHours: { open: '08:00', close: '19:00' },
      bookingRestrictions: { maxDurationHours: 4, minNoticeHours: 2, maxAdvanceDays: 30, allowWeekends: false },
      bufferMinutes: 10,
      maintenanceStatus: {
        isUnderMaintenance: true,
        reason: 'Scheduled acoustic wall dampening upgrade and ceiling projector recalibration',
        startDate: new Date(Date.now() - 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      },
      isActive: true,
      imageUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
    },
    {
      name: 'Open Air Amphitheater',
      category: 'other',
      description:
        'Open-air paved amphitheater with grass terraces, outdoor stage lighting conduits, and power outlets for cultural festivals, science exhibitions, and orientation rally.',
      location: { building: 'Main Campus Quadrangle', floor: 'Ground Level', roomNumber: 'OAT-STAGE' },
      capacity: 500,
      facilities: ['Open-Air Stage', 'Three-Phase 60A Power', 'Weather-Resistant Audio Conduits', 'Lawn Seating'],
      operatingHours: { open: '09:00', close: '21:00' },
      bookingRestrictions: { maxDurationHours: 8, minNoticeHours: 12, maxAdvanceDays: 60, allowWeekends: true },
      bufferMinutes: 45,
      maintenanceStatus: { isUnderMaintenance: false },
      isActive: true,
      imageUrl: '/src/assets/images/hero_academic_campus_1793023440205.jpg',
    },
  ];

  const createdResources = await Resource.insertMany(resourcesData);
  console.log(`Created ${createdResources.length} detailed academic resources.`);

  const seminarHall = createdResources[0]; // Seminar Hall 1
  const mainAuditorium = createdResources[1]; // Main Auditorium
  const miniAuditorium = createdResources[2]; // Mini Auditorium
  const compLab = createdResources[3]; // Computer Lab 1
  const bioLab = createdResources[4]; // Biotechnology Lab
  const smartHall = createdResources[5]; // Smart Classroom 101

  // 3. Create Sample Bookings (approved, pending, rejected, cancelled)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  const t1Start = new Date(tomorrow);
  t1Start.setHours(10, 0, 0, 0);
  const t1End = new Date(tomorrow);
  t1End.setHours(12, 30, 0, 0);

  const t2Start = new Date(tomorrow);
  t2Start.setHours(14, 0, 0, 0);
  const t2End = new Date(tomorrow);
  t2End.setHours(16, 30, 0, 0);

  const t3Start = new Date(dayAfterTomorrow);
  t3Start.setHours(11, 0, 0, 0);
  const t3End = new Date(dayAfterTomorrow);
  t3End.setHours(13, 0, 0, 0);

  const t4Start = new Date(nextWeek);
  t4Start.setHours(9, 30, 0, 0);
  const t4End = new Date(nextWeek);
  t4End.setHours(12, 0, 0, 0);

  // Approved booking 1: Seminar Hall 1
  const booking1 = await Booking.create({
    bookingRef: 'BK-2026-1042',
    user: facultyCS._id,
    resource: seminarHall._id,
    eventTitle: 'Distinguished Lecture on Generative AI Architectures',
    purpose: 'Invited guest keynote by ACM Turing Fellow for undergraduate and graduate computer engineering researchers.',
    department: 'Computer Science & Engineering',
    eventCategory: 'seminar',
    startDateTime: t1Start,
    endDateTime: t1End,
    expectedAttendees: 150,
    contactPhone: '+1 (555) 019-8234',
    specialRequirements: 'Dual high-resolution screens with wireless presentation clicker and podium lapel microphone.',
    status: 'approved',
    approvalDetails: {
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      remarks: 'Approved. AV technicians have been notified for stage setup.',
    },
    statusHistory: [
      { status: 'pending', changedBy: facultyCS._id, timestamp: new Date(Date.now() - 3600000 * 24), note: 'Submitted' },
      { status: 'approved', changedBy: adminUser._id, timestamp: new Date(), note: 'Approved by Dean' },
    ],
  });

  // Approved booking 2: Computer Lab 1
  const booking2 = await Booking.create({
    bookingRef: 'BK-2026-2109',
    user: studentAlex._id,
    resource: compLab._id,
    eventTitle: 'Annual Campus Hackathon - GPU Compute Sprint',
    purpose: '24-hour university coding competition hackathon focusing on distributed systems and open-source tooling.',
    department: 'Computer Science & Engineering',
    eventCategory: 'student_club',
    startDateTime: t2Start,
    endDateTime: t2End,
    expectedAttendees: 50,
    contactPhone: '+1 (555) 019-7412',
    specialRequirements: 'Need root privileges on local workstation cluster and extended high-bandwidth access.',
    status: 'approved',
    approvalDetails: {
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      remarks: 'Approved with faculty advisor concurrence.',
    },
    statusHistory: [
      { status: 'pending', changedBy: studentAlex._id, timestamp: new Date(Date.now() - 3600000 * 12), note: 'Submitted' },
      { status: 'approved', changedBy: adminUser._id, timestamp: new Date(), note: 'Approved' },
    ],
  });

  // Pending booking 1: Main Auditorium
  const booking3 = await Booking.create({
    bookingRef: 'BK-2026-3841',
    user: facultyBio._id,
    resource: mainAuditorium._id,
    eventTitle: 'International Bio-Engineering & Healthcare Summit 2026',
    purpose: 'Pan-university research conference featuring paper presentations, clinical demonstrations, and poster sessions.',
    department: 'Biotechnology & Life Sciences',
    eventCategory: 'conference',
    startDateTime: t4Start,
    endDateTime: t4End,
    expectedAttendees: 400,
    contactPhone: '+1 (555) 019-3321',
    specialRequirements: 'Audio-visual broadcast hookup for external university media and catering service tables in foyer.',
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: facultyBio._id, timestamp: new Date(), note: 'Submitted booking request for administrative review.' },
    ],
  });

  // Pending booking 2: Smart Classroom 101
  const booking4 = await Booking.create({
    bookingRef: 'BK-2026-4552',
    user: studentPriya._id,
    resource: smartHall._id,
    eventTitle: 'IEEE Student Branch Technical Paper Presentation Workshop',
    purpose: 'Technical writing and LaTeX presentation mentoring workshop for 3rd and 4th year engineering students.',
    department: 'Electronics & Communication',
    eventCategory: 'workshop',
    startDateTime: t3Start,
    endDateTime: t3End,
    expectedAttendees: 65,
    contactPhone: '+1 (555) 019-5561',
    specialRequirements: 'Microphone and whiteboard markers.',
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: studentPriya._id, timestamp: new Date(), note: 'Submitted' },
    ],
  });

  // Rejected booking
  await Booking.create({
    bookingRef: 'BK-2026-5120',
    user: studentAlex._id,
    resource: seminarHall._id,
    eventTitle: 'Informal Gaming Society LAN Session',
    purpose: 'Recreational esports club tournament during evening study hours.',
    department: 'Computer Science & Engineering',
    eventCategory: 'cultural',
    startDateTime: new Date(tomorrow.getTime() + 3600000 * 8),
    endDateTime: new Date(tomorrow.getTime() + 3600000 * 12),
    expectedAttendees: 120,
    contactPhone: '+1 (555) 019-7412',
    status: 'rejected',
    rejectionReason: 'Seminar hall bookings are restricted to formal academic presentations, research conferences, and institutional assemblies.',
    statusHistory: [
      { status: 'pending', changedBy: studentAlex._id, timestamp: new Date(Date.now() - 3600000 * 30), note: 'Submitted' },
      { status: 'rejected', changedBy: adminUser._id, timestamp: new Date(), note: 'Rejected by admin' },
    ],
  });

  // Cancelled booking
  await Booking.create({
    bookingRef: 'BK-2026-6201',
    user: facultyCS._id,
    resource: bioLab._id,
    eventTitle: 'Cross-Departmental Computational Biology Seminar',
    purpose: 'Joint departmental discussion on protein folding algorithms.',
    department: 'Computer Science & Engineering',
    eventCategory: 'seminar',
    startDateTime: new Date(nextWeek.getTime() + 3600000 * 2),
    endDateTime: new Date(nextWeek.getTime() + 3600000 * 5),
    expectedAttendees: 30,
    status: 'cancelled',
    cancellationDetails: {
      cancelledBy: facultyCS._id,
      cancelledAt: new Date(),
      reason: 'Keynote presenter travel rescheduled to following month.',
    },
    statusHistory: [
      { status: 'pending', changedBy: facultyCS._id, timestamp: new Date(Date.now() - 3600000 * 48), note: 'Submitted' },
      { status: 'cancelled', changedBy: facultyCS._id, timestamp: new Date(), note: 'Cancelled by requester' },
    ],
  });

  console.log('Created sample bookings across all lifecycle statuses (approved, pending, rejected, cancelled).');

  // 4. Create Institutional Events
  await Event.create({
    title: 'Distinguished Lecture on Generative AI Architectures',
    description: 'Renowned Turing Fellow delivers keynote on frontier models, reasoning engines, and safety alignment in academic research.',
    organizer: 'Prof. Rajesh Sharma (Dept. of Computer Science & Engineering)',
    department: 'Computer Science & Engineering',
    category: 'Academic',
    startDateTime: t1Start,
    endDateTime: t1End,
    resource: seminarHall._id,
    booking: booking1._id,
    isPublished: true,
    bannerUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
    targetAudience: 'All Faculty & Graduate Scholars',
    maxParticipants: 180,
    tags: ['Artificial Intelligence', 'Keynote', 'Computer Science'],
  });

  await Event.create({
    title: 'ACM Annual Campus Hackathon - 24H GPU Compute Sprint',
    description: 'Annual campus coding marathon building scalable distributed systems and intelligence applications.',
    organizer: 'Alex Rivera (President, ACM Student Chapter)',
    department: 'Computer Science & Engineering',
    category: 'Student Activities',
    startDateTime: t2Start,
    endDateTime: t2End,
    resource: compLab._id,
    booking: booking2._id,
    isPublished: true,
    bannerUrl: '/src/assets/images/resource_computer_lab_1793023441272.jpg',
    targetAudience: 'All Registered Students',
    maxParticipants: 60,
    tags: ['Hackathon', 'Coding', 'Open Source'],
  });

  await Event.create({
    title: 'National Technology Day & Annual Convocation 2026',
    description: 'Grand institutional symposium honoring research excellence, student graduations, and academic honors.',
    organizer: 'Office of the Dean of Academic Affairs',
    department: 'Academic Administration',
    category: 'Institutional',
    startDateTime: t4Start,
    endDateTime: t4End,
    resource: mainAuditorium._id,
    isPublished: true,
    bannerUrl: '/src/assets/images/resource_auditorium_1793023440037.jpg',
    targetAudience: 'All Campus Community',
    maxParticipants: 850,
    tags: ['Convocation', 'Celebration', 'Patents'],
  });

  // 5. Create Persistent Notifications
  await Notification.create({
    recipient: facultyCS._id,
    type: 'booking_approved',
    title: 'Booking Approved: Seminar Hall 1',
    message: 'Your booking BK-2026-1042 for "Distinguished Lecture on Generative AI Architectures" has been approved by Dr. Arthur Vance.',
    relatedBooking: booking1._id,
    actionUrl: `/bookings/${booking1._id}`,
    isRead: false,
  });

  await Notification.create({
    recipient: studentAlex._id,
    type: 'booking_approved',
    title: 'Booking Approved: Computer Lab 1',
    message: 'Your booking BK-2026-2109 for "Annual Campus Hackathon" has been confirmed.',
    relatedBooking: booking2._id,
    actionUrl: `/bookings/${booking2._id}`,
    isRead: false,
  });

  await Notification.create({
    recipient: adminUser._id,
    type: 'booking_submitted',
    title: 'Pending Approval: International Bio-Engineering Summit',
    message: 'Dr. Elena Rostova submitted booking request BK-2026-3841 for Main Auditorium.',
    relatedBooking: booking3._id,
    actionUrl: '/admin/approvals',
    isRead: false,
  });

  // 6. Create Audit Logs
  await AuditLog.create({
    actor: adminUser._id,
    actorEmail: adminUser.email,
    actorRole: 'admin',
    action: 'BOOKING_APPROVE',
    entityType: 'Booking',
    entityId: booking1._id.toString(),
    description: `Approved booking BK-2026-1042 for Seminar Hall 1`,
    metadata: { remarks: 'Approved. AV technicians notified.' },
  });

  await AuditLog.create({
    actor: adminUser._id,
    actorEmail: adminUser.email,
    actorRole: 'admin',
    action: 'RESOURCE_CREATE',
    entityType: 'Resource',
    entityId: seminarHall._id.toString(),
    description: `Created resource "Seminar Hall 1" with capacity 180`,
  });

  console.log('Database seeding completed successfully with rich academic demonstration data.');
}
