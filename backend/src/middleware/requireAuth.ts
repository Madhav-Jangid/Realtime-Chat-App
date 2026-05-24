import { NextFunction, Response } from 'express';
import { AuthRequest } from './authMiddleware';

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new Error('Auth middleware not applied');
  }
  next();
}
