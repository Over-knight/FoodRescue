import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get user's notifications (paginated, with filters)
router.get('/', getNotifications);

// PATCH /api/notifications/read-all - Mark all notifications as read (must be before /:id)
router.patch('/read-all', markAllNotificationsAsRead);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', markNotificationAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

export default router;
