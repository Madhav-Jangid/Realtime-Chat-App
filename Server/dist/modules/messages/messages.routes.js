import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/app-error.js';
import { Message } from '../../models/message.model.js';
import { Conversation } from '../../models/conversation.model.js';
const router = Router();
// Create message
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const { conversationId, text } = req.body;
    const senderId = req.user?.id;
    if (!conversationId || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Verify conversation exists and user is member
    const conversation = await Conversation.findById(conversationId);
    if (!conversation ||
        !conversation.members.some((m) => m.toString() === senderId)) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    const message = new Message({
        conversationId,
        sender: senderId,
        text: text.trim(),
        seenBy: [senderId], // Sender has seen their own message
    });
    await message.save();
    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    await message.populate('sender', 'username avatar');
    res.status(201).json(message);
}));
// Mark message as seen
router.put('/:messageId/seen', authMiddleware, asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user?.id;
    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    // Check if user is in conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation?.members.some((m) => m.toString() === userId)) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    // Add user to seenBy if not already there
    if (!message.seenBy.some((id) => id.toString() === userId)) {
        message.seenBy.push(userId);
        await message.save();
    }
    res.json(message);
}));
export default router;
