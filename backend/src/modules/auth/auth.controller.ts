import { Request, Response } from 'express';
import { clerkLoginSchema, signupSchema, loginSchema } from './auth.validation';
import * as authService from './auth.service';

export async function signup(req: Request, res: Response): Promise<void> {
  const data = signupSchema.parse(req.body);
  const result = await authService.signup(data);

  res.status(201).json({ success: true, message: 'Signup successful', data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data.email, data.password);

  res.status(200).json({ success: true, message: 'Login successful', data: result });
}

export async function clerkLogin(req: Request, res: Response): Promise<void> {
  const data = clerkLoginSchema.parse(req.body);
  const result = await authService.clerkLogin(data.clerkToken);

  res.status(200).json({ success: true, message: 'Clerk login successful', data: result });
}
