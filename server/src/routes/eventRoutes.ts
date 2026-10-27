import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Read events is open to authenticated or public
router.get('/', getEvents);
router.get('/:id', getEventById);

// Create, edit, and delete events (Admin / Faculty / Staff)
router.post('/', authenticate, authorize('admin', 'faculty', 'staff'), createEvent);
router.patch('/:id', authenticate, authorize('admin', 'faculty', 'staff'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

export default router;
