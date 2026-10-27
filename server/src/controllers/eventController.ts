import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const { category, department, isPublished, startDate, search } = req.query;
    const query: any = {};

    // By default only published events for public, unless explicitly queried
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    } else {
      query.isPublished = true;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (startDate) {
      query.startDateTime = { $gte: new Date(String(startDate)) };
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      query.$or = [{ title: regex }, { description: regex }, { organizer: regex }];
    }

    const events = await Event.find(query)
      .populate('resource', 'name category location')
      .populate('booking', 'bookingRef status')
      .sort({ startDateTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = await Event.findById(id)
      .populate('resource', 'name category location capacity facilities imageUrl')
      .populate('booking', 'bookingRef startDateTime endDateTime status');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({ success: true, event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      organizer,
      department,
      category,
      startDateTime,
      endDateTime,
      resource,
      booking,
      isPublished = true,
      bannerUrl,
      targetAudience,
      maxParticipants,
      tags,
    } = req.body;

    if (!title || !description || !organizer || !department || !startDateTime || !endDateTime) {
      res.status(400).json({
        success: false,
        message: 'Title, description, organizer, department, start and end dates are required.',
      });
      return;
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      organizer: organizer.trim(),
      department: department.trim(),
      category: category || 'Academic',
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      resource: resource || undefined,
      booking: booking || undefined,
      isPublished: Boolean(isPublished),
      bannerUrl: bannerUrl || '',
      targetAudience: targetAudience || 'All Campus',
      maxParticipants: Number(maxParticipants) || 0,
      tags: Array.isArray(tags) ? tags : [],
    });

    await logAuditEvent({
      actor: req.user?._id,
      actorEmail: req.user?.email || 'admin@academic.edu',
      actorRole: req.user?.role || 'admin',
      action: 'EVENT_CREATE',
      entityType: 'Event',
      entityId: event._id.toString(),
      description: `Created campus event "${event.title}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Campus event published successfully.',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const fields = [
      'title',
      'description',
      'organizer',
      'department',
      'category',
      'startDateTime',
      'endDateTime',
      'resource',
      'booking',
      'isPublished',
      'bannerUrl',
      'targetAudience',
      'maxParticipants',
      'tags',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        event[f] = req.body[f];
      }
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event removed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
