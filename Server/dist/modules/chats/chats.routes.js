import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/app-error.js';
import { Conversation } from '../../models/conversation.model.js';
import { Message } from '../../models/message.model.js';
import { Types } from 'mongoose';
const router = Router();
// Get user conversations
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const conversations = await Conversation.find({
        members: userId,
    })
        .populate('members', 'username name avatar')
        .sort({ lastMessageAt: -1 });
    res.json(conversations);
}));
// Get messages for a conversation (paginated)
router.get('/:conversationId/messages', authMiddleware, asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const { cursor, limit = '20' } = req.query;
    // Verify user is member of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation ||
        !conversation.members.some((m) => m.toString() === userId)) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    // Build query
    let query = Message.find({ conversationId });
    if (cursor) {
        query = query.lt('_id', new Types.ObjectId(cursor));
    }
    const messages = await query
        .sort({ _id: -1 })
        .limit(parseInt(limit))
        .populate('sender', 'username avatar')
        .populate('seenBy', 'username');
    res.json(messages.reverse());
}));
export default router;
