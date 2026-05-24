import { Socket } from 'socket.io';
import { verifyToken } from '../../middleware/auth.js';
import { AppError } from '../../utils/app-error.js';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function socketAuthMiddleware(socket: AuthenticatedSocket, next: Function) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new AppError('No token provided', 401));
    }

    const decoded = verifyToken(token);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(error);
  }
}
