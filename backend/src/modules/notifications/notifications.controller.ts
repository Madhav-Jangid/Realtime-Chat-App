import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as notificationsService from './notifications.service';

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional()
});

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const query = querySchema.parse(req.query);
  const data = await notificationsService.listNotifications(req.user!.userId, query.cursor, query.limit);
  res.status(200).json({ success: true, data });
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  const data = await notificationsService.markAsRead(req.user!.userId, req.params.id);
  res.status(200).json({ success: true, data });
}

export async function markAllRead(req: AuthRequest, res: Response): Promise<void> {
  const data = await notificationsService.markAllAsRead(req.user!.userId);
  res.status(200).json({ success: true, data });
}

export async function deleteNotification(req: AuthRequest, res: Response): Promise<void> {
  const data = await notificationsService.deleteNotification(req.user!.userId, req.params.id);
  res.status(200).json({ success: true, data });
}
