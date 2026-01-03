import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticateJWT } from '../../common/middleware/auth.middleware';

const router: Router = Router();

// All notification routes require authentication
router.use(authenticateJWT);

// Get user notifications
router.get('/', NotificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;