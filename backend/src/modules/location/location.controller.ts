import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as locationService from './location.service';

export async function updateLocation(req: AuthRequest, res: Response): Promise<void> {
  const data = await locationService.updateLocation(req.user!.userId, req.body);
  res.status(200).json({ success: true, message: 'Location updated', data });
}
