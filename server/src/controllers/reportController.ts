import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Resource } from '../models/Resource';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export async function getOverviewMetrics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      totalUsers,
      totalResources,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      totalEvents,
    ] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
      Booking.countDocuments({ status: 'rejected' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Event.countDocuments(),
    ]);

    // Calculate booking approval rate
    const reviewedBookings = approvedBookings + rejectedBookings;
    const approvalRate = reviewedBookings > 0 ? Math.round((approvedBookings / reviewedBookings) * 100) : 100;

    // Active resources vs maintenance
    const [activeResources, maintenanceResources] = await Promise.all([
      Resource.countDocuments({ isActive: true, 'maintenanceStatus.isUnderMaintenance': false }),
      Resource.countDocuments({ 'maintenanceStatus.isUnderMaintenance': true }),
    ]);

    // Bookings by status distribution
    const statusDistribution = [
      { name: 'Approved', value: approvedBookings, color: '#16a34a' },
      { name: 'Pending', value: pendingBookings, color: '#eab308' },
      { name: 'Rejected', value: rejectedBookings, color: '#dc2626' },
      { name: 'Cancelled', value: cancelledBookings, color: '#64748b' },
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalResources,
        activeResources,
        maintenanceResources,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        cancelledBookings,
        approvalRate,
        totalEvents,
        statusDistribution,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAnalyticsData(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Bookings by department
    const bookingsByDept = await Booking.aggregate([
      {
        $group: {
          _id: '$department',
          totalBookings: { $sum: 1 },
          approvedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 8 },
      {
        $project: {
          department: '$_id',
          totalBookings: 1,
          approvedBookings: 1,
          _id: 0,
        },
      },
    ]);

    // 2. Most frequently booked resources
    const topResources = await Booking.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$resource',
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { bookingsCount: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: '_id',
          as: 'resourceInfo',
        },
      },
      { $unwind: '$resourceInfo' },
      {
        $project: {
          name: '$resourceInfo.name',
          category: '$resourceInfo.category',
          capacity: '$resourceInfo.capacity',
          building: '$resourceInfo.location.building',
          bookingsCount: 1,
        },
      },
    ]);

    // 3. Peak booking hours distribution
    const bookings = await Booking.find({ status: 'approved' }).select('startDateTime').lean();
    const hourlyCounts: Record<number, number> = {};
    for (let h = 8; h <= 20; h++) hourlyCounts[h] = 0;

    bookings.forEach((b) => {
      const hour = new Date(b.startDateTime).getHours();
      if (hourlyCounts[hour] !== undefined) {
        hourlyCounts[hour]++;
      }
    });

    const peakHours = Object.keys(hourlyCounts).map((h) => ({
      hour: `${h.padStart(2, '0')}:00`,
      bookings: hourlyCounts[Number(h)],
    }));

    // 4. Monthly trends (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAggregation = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$startDateTime' },
            month: { $month: '$startDateTime' },
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyTrends = monthlyAggregation.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      total: m.total,
      approved: m.approved,
    }));

    res.status(200).json({
      success: true,
      data: {
        bookingsByDept,
        topResources,
        peakHours,
        monthlyTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function exportReportCSV(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, department } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email department')
      .populate('resource', 'name category location')
      .populate('approvalDetails.approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Construct valid CSV
    const headers = [
      'Booking Reference',
      'Event Title',
      'Resource Name',
      'Resource Category',
      'Location',
      'Requester Name',
      'Requester Email',
      'Department',
      'Start Date & Time',
      'End Date & Time',
      'Attendees',
      'Status',
      'Approved By',
      'Created Date',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = bookings.map((b: any) => [
      escapeCsv(b.bookingRef),
      escapeCsv(b.eventTitle),
      escapeCsv(b.resource?.name || 'N/A'),
      escapeCsv(b.resource?.category || 'N/A'),
      escapeCsv(`${b.resource?.location?.building || ''} Rm ${b.resource?.location?.roomNumber || ''}`),
      escapeCsv(b.user?.name || 'N/A'),
      escapeCsv(b.user?.email || 'N/A'),
      escapeCsv(b.department || 'N/A'),
      escapeCsv(new Date(b.startDateTime).toISOString()),
      escapeCsv(new Date(b.endDateTime).toISOString()),
      escapeCsv(b.expectedAttendees),
      escapeCsv(b.status.toUpperCase()),
      escapeCsv(b.approvalDetails?.approvedBy?.name || 'N/A'),
      escapeCsv(new Date(b.createdAt).toISOString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="academic_bookings_export_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
