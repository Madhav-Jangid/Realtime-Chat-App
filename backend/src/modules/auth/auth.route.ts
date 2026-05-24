import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/signup', asyncHandler(authController.signup));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/clerk/login', asyncHandler(authController.clerkLogin));
