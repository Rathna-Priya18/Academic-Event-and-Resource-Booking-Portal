import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// User and staff booking operations
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

// Admin-only approval and oversight operations
router.get('/', authorize('admin'), getBookings);
router.patch('/:id/approve', authorize('admin'), approveBooking);
router.patch('/:id/reject', authorize('admin'), rejectBooking);

export default router;
