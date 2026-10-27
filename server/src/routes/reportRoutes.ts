import { Router } from 'express';
import {
  getOverviewMetrics,
  getAnalyticsData,
  exportReportCSV,
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Reports are restricted to administrators
router.use(authenticate, authorize('admin'));

router.get('/overview', getOverviewMetrics);
router.get('/analytics', getAnalyticsData);
router.get('/export', exportReportCSV);

export default router;
