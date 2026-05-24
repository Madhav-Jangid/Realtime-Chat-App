import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as friendsService from './friends.service';

const sendSchema = z.object({ receiverId: z.string().min(1) });

export async function sendRequest(req: AuthRequest, res: Response): Promise<void> {
  const body = sendSchema.parse(req.body);
  const request = await friendsService.sendRequest(req.user!.userId, body.receiverId);
  res.status(201).json({ success: true, message: 'Friend request sent', data: request });
}

export async function acceptRequest(req: AuthRequest, res: Response): Promise<void> {
  const data = await friendsService.acceptRequest(req.user!.userId, req.params.id);
  res.status(200).json({ success: true, message: 'Friend request accepted', data });
}

export async function rejectRequest(req: AuthRequest, res: Response): Promise<void> {
  const data = await friendsService.rejectRequest(req.user!.userId, req.params.id);
  res.status(200).json({ success: true, message: 'Friend request rejected', data });
}

export async function listFriends(req: AuthRequest, res: Response): Promise<void> {
  const data = await friendsService.listFriends(req.user!.userId);
  res.status(200).json({ success: true, data });
}

export async function listRequests(req: AuthRequest, res: Response): Promise<void> {
  const data = await friendsService.listRequests(req.user!.userId);
  res.status(200).json({ success: true, data });
}

export async function unfriend(req: AuthRequest, res: Response): Promise<void> {
  const data = await friendsService.unfriend(req.user!.userId, req.params.friendId);
  res.status(200).json({ success: true, message: 'Friend removed successfully', data });
}
