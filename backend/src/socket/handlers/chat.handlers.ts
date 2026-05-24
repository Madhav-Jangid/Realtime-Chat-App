import { Types } from 'mongoose';
import { Server } from 'socket.io';
import { ConversationModel } from '../../models/Conversation';
import { MessageModel } from '../../models/Message';
import { areFriends } from '../../modules/friends/friends.service';
import { createNotification } from '../../modules/notifications/notifications.service';
import { UserModel } from '../../models/User';
import { AuthedSocket } from '../middleware/socketAuth';

interface OnlineUsersStore {
  set(userId: string, socketId: string): void;
  deleteBySocketId(socketId: string): void;
  setActiveConversation(userId: string, conversationId: string): void;
  getActiveConversation(userId: string): string | undefined;
}

function roomName(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function registerChatHandlers(io: Server, socket: AuthedSocket, onlineUsers: OnlineUsersStore): void {
  const userId = socket.userId!;
  onlineUsers.set(userId, socket.id);

  socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation) return;
    if (!conversation.members.map(String).includes(userId)) return;
    socket.join(roomName(conversationId));
    onlineUsers.setActiveConversation(userId, conversationId);
  });

  socket.on('message:send', async ({ conversationId, text }: { conversationId: string; text: string }) => {
    if (!text?.trim()) return;

    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation) return;
    if (!conversation.members.map(String).includes(userId)) return;

    const memberIds = conversation.members.map(String);
    const otherMemberId = memberIds.find((id) => id !== userId);
    if (!otherMemberId) return;

    const friends = await areFriends(userId, otherMemberId);
    if (!friends) return;

    const message = await MessageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(userId),
      text: text.trim(),
      seenBy: [new Types.ObjectId(userId)]
    });

    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message.text,
      lastMessageAt: new Date()
    });

    io.to(roomName(conversationId)).emit('message:new', {
      _id: String(message._id),
      conversationId,
      sender: userId,
      text: message.text,
      seenBy: message.seenBy.map(String),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      editedAt: message.editedAt
    });

    const recipientActiveConversation = onlineUsers.getActiveConversation(otherMemberId);
    if (recipientActiveConversation !== conversationId) {
      const sender = await UserModel.findById(userId).select('username name');
      const senderName = sender?.username || sender?.name || 'New message';
      try {
        await createNotification({
          recipient: otherMemberId,
          actorUserId: userId,
          type: 'message.new',
          title: senderName,
          body: message.text,
          conversationId,
          entityId: String(message._id)
        });
      } catch (_error) {
        // Non-blocking side effect.
      }
    }
  });

  socket.on('message:edit', async ({ conversationId, messageId, text }: { conversationId: string; messageId: string; text: string }) => {
    if (!text?.trim()) return;

    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation || !conversation.members.map(String).includes(userId)) return;

    const message = await MessageModel.findById(messageId);
    if (!message) return;
    if (String(message.sender) !== userId) return;
    if (String(message.conversationId) !== conversationId) return;

    message.text = text.trim();
    message.editedAt = new Date();
    await message.save();

    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message.text,
      lastMessageAt: new Date()
    });

    io.to(roomName(conversationId)).emit('message:updated', {
      conversationId,
      messageId,
      text: message.text,
      editedAt: message.editedAt,
      updatedAt: message.updatedAt
    });
  });

  socket.on('message:delete', async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation || !conversation.members.map(String).includes(userId)) return;

    const message = await MessageModel.findById(messageId);
    if (!message) return;
    if (String(message.sender) !== userId) return;
    if (String(message.conversationId) !== conversationId) return;

    await MessageModel.findByIdAndDelete(messageId);

    const latest = await MessageModel.findOne({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 })
      .select('text createdAt');

    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: latest?.text || '',
      lastMessageAt: latest?.createdAt || null
    });

    io.to(roomName(conversationId)).emit('message:deleted', {
      conversationId,
      messageId
    });
  });

  socket.on('typing:start', async ({ conversationId }: { conversationId: string }) => {
    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation || !conversation.members.map(String).includes(userId)) return;
    socket.to(roomName(conversationId)).emit('typing:update', { conversationId, userId, isTyping: true });
  });

  socket.on('typing:stop', async ({ conversationId }: { conversationId: string }) => {
    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation || !conversation.members.map(String).includes(userId)) return;
    socket.to(roomName(conversationId)).emit('typing:update', { conversationId, userId, isTyping: false });
  });

  socket.on('message:seen', async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
    const conversation = await ConversationModel.findById(conversationId).select('members');
    if (!conversation || !conversation.members.map(String).includes(userId)) return;

    await MessageModel.findByIdAndUpdate(messageId, {
      $addToSet: { seenBy: new Types.ObjectId(userId) }
    });

    io.to(roomName(conversationId)).emit('message:seen:update', {
      conversationId,
      messageId,
      seenByUserId: userId
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.deleteBySocketId(socket.id);
  });
}
