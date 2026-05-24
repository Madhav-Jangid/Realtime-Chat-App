import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';

export interface AuthedSocket extends Socket {
  userId?: string;
}

export function socketAuth(socket: AuthedSocket, next: (err?: Error) => void): void {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new AppError('Unauthorized socket', 401));
    }

    const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
    socket.userId = payload.userId;
    next();
  } catch {
    next(new AppError('Invalid socket token', 401));
  }
}
