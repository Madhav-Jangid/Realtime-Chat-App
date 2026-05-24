import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.js';
import { Conversation } from '../../models/conversation.model.js';

export const typingHandler = {
  start(
    io: Server,
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    const { conversationId } = data;
    const userId = socket.userId!;

    // Emit typing status to conversation room
    io.to(conversationId).emit('typing:update', {
      conversationId,
      userId,
      isTyping: true,
    });
  },

  stop(
    io: Server,
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    const { conversationId } = data;
    const userId = socket.userId!;

    // Emit stop typing to conversation room
    io.to(conversationId).emit('typing:update', {
      conversationId,
      userId,
      isTyping: false,
    });
  },
};
