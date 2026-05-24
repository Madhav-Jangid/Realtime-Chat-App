import { Server } from 'socket.io';
import { socketAuth, AuthedSocket } from './middleware/socketAuth';
import { registerChatHandlers } from './handlers/chat.handlers';

class OnlineUsers {
  private readonly userToSocket = new Map<string, string>();
  private readonly socketToUser = new Map<string, string>();
  private readonly activeConversationByUser = new Map<string, string>();

  set(userId: string, socketId: string): void {
    this.userToSocket.set(userId, socketId);
    this.socketToUser.set(socketId, userId);
  }

  getSocketId(userId: string): string | undefined {
    return this.userToSocket.get(userId);
  }

  setActiveConversation(userId: string, conversationId: string): void {
    this.activeConversationByUser.set(userId, conversationId);
  }

  getActiveConversation(userId: string): string | undefined {
    return this.activeConversationByUser.get(userId);
  }

  deleteBySocketId(socketId: string): void {
    const userId = this.socketToUser.get(socketId);
    if (!userId) {
      return;
    }

    this.socketToUser.delete(socketId);
    this.userToSocket.delete(userId);
    this.activeConversationByUser.delete(userId);
  }
}

export function setupSocket(io: Server): void {
  const onlineUsers = new OnlineUsers();

  io.use(socketAuth);

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket as AuthedSocket, onlineUsers);
  });
}
