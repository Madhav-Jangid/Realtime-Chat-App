import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as chatsService from './chats.service';

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  const data = await chatsService.listUserConversations(req.user!.userId);
  res.status(200).json({ success: true, data });
}

export async function deleteConversation(req: AuthRequest, res: Response): Promise<void> {
  const data = await chatsService.deleteConversation(req.user!.userId, req.params.conversationId);
  res.status(200).json({ success: true, message: 'Conversation deleted', data });
}
