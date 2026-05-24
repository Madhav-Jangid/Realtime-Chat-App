import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/app-error.js';
import { signup, login } from './auth.service.js';

export const signupController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await signup({ username, name, email, password });
  res.status(201).json(result);
});

export const loginController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const result = await login({ email, password });
  res.json(result);
});
