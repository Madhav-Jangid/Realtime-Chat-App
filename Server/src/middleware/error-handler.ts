import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map((err: any) => err.message)
      .join(', ');
    return res.status(400).json({ error: messages });
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  // Default error
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}
