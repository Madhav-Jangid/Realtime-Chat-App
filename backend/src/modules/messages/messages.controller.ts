import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as messagesService from './messages.service';

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional()
});

const searchSchema = z.object({
  q: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).optional()
});

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  const query = querySchema.parse(req.query);
  const data = await messagesService.getMessages(
    req.user!.userId,
    req.params.conversationId,
    query.cursor,
    query.limit
  );
  res.status(200).json({ success: true, data });
}

export async function searchMessages(req: AuthRequest, res: Response): Promise<void> {
  const query = searchSchema.parse(req.query);
  const data = await messagesService.searchMessages(
    req.user!.userId,
    req.params.conversationId,
    query.q,
    query.cursor,
    query.limit
  );
  res.status(200).json({ success: true, data });
}
