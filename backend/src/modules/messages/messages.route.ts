import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as messagesController from './messages.controller';

export const messagesRouter = Router();

messagesRouter.use(authMiddleware);
messagesRouter.get('/:conversationId/search', asyncHandler(messagesController.searchMessages));
messagesRouter.get('/:conversationId', asyncHandler(messagesController.getMessages));
