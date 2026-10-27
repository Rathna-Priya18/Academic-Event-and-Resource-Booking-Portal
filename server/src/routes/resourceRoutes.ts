import { Router } from 'express';
import {
  getResources,
  getResourceById,
  getResourceAvailability,
  createResource,
  updateResource,
  deleteResource,
  toggleMaintenance,
} from '../controllers/resourceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public / Authenticated read routes
router.get('/', getResources);
router.get('/:id', getResourceById);
router.get('/:id/availability', getResourceAvailability);

// Admin-restricted mutation routes
router.post('/', authenticate, authorize('admin'), createResource);
router.patch('/:id', authenticate, authorize('admin'), updateResource);
router.patch('/:id/maintenance', authenticate, authorize('admin'), toggleMaintenance);
router.delete('/:id', authenticate, authorize('admin'), deleteResource);

export default router;
