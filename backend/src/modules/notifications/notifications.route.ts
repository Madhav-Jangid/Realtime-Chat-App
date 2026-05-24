import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as notificationsController from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);
notificationsRouter.get('/', asyncHandler(notificationsController.getNotifications));
notificationsRouter.patch('/read-all', asyncHandler(notificationsController.markAllRead));
notificationsRouter.patch('/:id/read', asyncHandler(notificationsController.markNotificationRead));
notificationsRouter.delete('/:id', asyncHandler(notificationsController.deleteNotification));
