import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export function verifyToken(token: string): { id: string } {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
    return decoded;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(error);
  }
}
