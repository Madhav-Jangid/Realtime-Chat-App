import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import friendsRoutes from '../modules/friends/friends.routes.js';
import chatsRoutes from '../modules/chats/chats.routes.js';
import messagesRoutes from '../modules/messages/messages.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/friends', friendsRoutes);
router.use('/conversations', chatsRoutes);
router.use('/messages', messagesRoutes);

export default router;
