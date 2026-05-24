import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as friendsController from './friends.controller';

export const friendsRouter = Router();

friendsRouter.use(authMiddleware);
friendsRouter.post('/request', asyncHandler(friendsController.sendRequest));
friendsRouter.post('/:id/accept', asyncHandler(friendsController.acceptRequest));
friendsRouter.post('/:id/reject', asyncHandler(friendsController.rejectRequest));
friendsRouter.delete('/:friendId', asyncHandler(friendsController.unfriend));
friendsRouter.get('/', asyncHandler(friendsController.listFriends));
friendsRouter.get('/requests', asyncHandler(friendsController.listRequests));
