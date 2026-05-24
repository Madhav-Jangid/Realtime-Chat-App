import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}
export declare function verifyToken(token: string): {
    id: string;
};
export declare function generateToken(userId: string): string;
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
