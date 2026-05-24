import { z } from 'zod';

export const signupSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  avatar: z.string().url().optional(),
  bio: z.string().max(300).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const clerkLoginSchema = z.object({
  clerkToken: z.string().min(10)
});
