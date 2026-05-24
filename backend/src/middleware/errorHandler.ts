import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal server error' });
}
