import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as chatsController from './chats.controller';

export const chatsRouter = Router();

chatsRouter.use(authMiddleware);
chatsRouter.get('/', asyncHandler(chatsController.getConversations));
chatsRouter.delete('/:conversationId', asyncHandler(chatsController.deleteConversation));
