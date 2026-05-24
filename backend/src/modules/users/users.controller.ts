import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as usersService from './users.service';

export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await usersService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
}

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  const results = await usersService.searchUsers(req.user!.userId, String(req.query.q || ''));
  res.status(200).json({ success: true, data: results });
}
