import { verifyToken } from '../../middleware/auth.js';
import { AppError } from '../../utils/app-error.js';
export function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new AppError('No token provided', 401));
        }
        const decoded = verifyToken(token);
        socket.userId = decoded.id;
        next();
    }
    catch (error) {
        next(error);
    }
}
