import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import resourceRoutes from './resourceRoutes';
import bookingRoutes from './bookingRoutes';
import eventRoutes from './eventRoutes';
import notificationRoutes from './notificationRoutes';
import reportRoutes from './reportRoutes';
import auditLogRoutes from './auditLogRoutes';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Academic Event & Resource Booking API',
    version: '1.0.0',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/audit-logs', auditLogRoutes);

export default apiRouter;
