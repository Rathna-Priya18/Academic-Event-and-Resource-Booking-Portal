import { Router } from 'express';
import { getUsers, getUserById, updateUser, toggleUserStatus } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin only routes for managing users
router.use(authenticate, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
