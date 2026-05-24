import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as usersController from './users.controller';

export const usersRouter = Router();

usersRouter.use(authMiddleware);
usersRouter.get('/search', asyncHandler(usersController.searchUsers));
usersRouter.get('/:id', asyncHandler(usersController.getUserById));
