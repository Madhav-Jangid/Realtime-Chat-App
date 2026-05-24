import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
    req.user = { userId: payload.userId };
    next();
  } catch {
    throw new AppError('Invalid token', 401);
  }
}
