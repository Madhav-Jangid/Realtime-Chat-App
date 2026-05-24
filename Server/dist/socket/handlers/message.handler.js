import { Message } from '../../models/message.model.js';
import { Conversation } from '../../models/conversation.model.js';
import { FriendRequest } from '../../models/friend-request.model.js';
export const messageHandler = {
    async send(io, socket, data) {
        try {
            const { conversationId, text } = data;
            const senderId = socket.userId;
            if (!conversationId || !text) {
                socket.emit('error', { message: 'Missing required fields' });
                return;
            }
            // Verify conversation exists and user is member
            const conversation = await Conversation.findById(conversationId);
            if (!conversation ||
                !conversation.members.some((m) => m.toString() === senderId)) {
                socket.emit('error', { message: 'Not authorized' });
                return;
            }
            // Verify friendship (only friends can chat)
            const receiverIds = conversation.members.filter((m) => m.toString() !== senderId);
            for (const receiverId of receiverIds) {
                const friendship = await FriendRequest.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId, status: 'accepted' },
                        { sender: receiverId, receiver: senderId, status: 'accepted' },
                    ],
                });
                if (!friendship) {
                    socket.emit('error', { message: 'Can only message friends' });
                    return;
                }
            }
            // Save message
            const message = new Message({
                conversationId,
                sender: senderId,
                text: text.trim(),
                seenBy: [senderId],
            });
            await message.save();
            await message.populate('sender', 'username avatar');
            // Update conversation
            conversation.lastMessage = text;
            conversation.lastMessageAt = new Date();
            await conversation.save();
            // Emit to conversation room
            io.to(conversationId).emit('message:new', message);
        }
        catch (error) {
            console.error('Message send error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    },
    async markSeen(io, socket, data) {
        try {
            const { messageId } = data;
            const userId = socket.userId;
            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('error', { message: 'Message not found' });
                return;
            }
            // Verify user is in conversation
            const conversation = await Conversation.findById(message.conversationId);
            if (!conversation?.members.some((m) => m.toString() === userId)) {
                socket.emit('error', { message: 'Not authorized' });
                return;
            }
            // Add user to seenBy
            if (!message.seenBy.some((id) => id.toString() === userId)) {
                message.seenBy.push(userId);
                await message.save();
            }
            // Emit update
            io.to(message.conversationId.toString()).emit('message:seen:update', {
                messageId,
                userId,
            });
        }
        catch (error) {
            console.error('Mark seen error:', error);
            socket.emit('error', { message: 'Failed to mark message as seen' });
        }
    },
};
