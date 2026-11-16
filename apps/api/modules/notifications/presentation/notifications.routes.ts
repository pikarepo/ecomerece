import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth';
import type { NotificationsController } from './notifications.controller';

export function createNotificationsRoutes(notificationsController: NotificationsController) {
  const NotificationRoutes = new Hono();

  // The inbox is strictly personal: every route is scoped to the caller.
  NotificationRoutes.get('/my/all', authMiddleware, notificationsController.getMyNotifications);
  NotificationRoutes.get(
    '/my/unread-count',
    authMiddleware,
    notificationsController.getUnreadCount,
  );
  NotificationRoutes.patch('/my/read-all', authMiddleware, notificationsController.markAllRead);
  NotificationRoutes.patch('/my/:id/read', authMiddleware, notificationsController.markRead);
  NotificationRoutes.delete('/my/:id', authMiddleware, notificationsController.dismiss);

  return NotificationRoutes;
}
