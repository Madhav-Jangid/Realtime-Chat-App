import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.route';
import { usersRouter } from '../modules/users/users.route';
import { friendsRouter } from '../modules/friends/friends.route';
import { chatsRouter } from '../modules/chats/chats.route';
import { messagesRouter } from '../modules/messages/messages.route';
import { locationRouter } from '../modules/location/location.route';
import { notificationsRouter } from '../modules/notifications/notifications.route';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/friends', friendsRouter);
apiRouter.use('/conversations', chatsRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.use('/location', locationRouter);
apiRouter.use('/notifications', notificationsRouter);
