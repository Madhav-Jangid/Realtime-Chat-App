import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/app-error.js';
import { FriendRequest } from '../../models/friend-request.model.js';
import { Conversation } from '../../models/conversation.model.js';
import { User } from '../../models/user.model.js';
const router = Router();
// Send friend request
router.post('/request', authMiddleware, asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user?.id;
    if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID required' });
    }
    if (senderId === receiverId) {
        return res.status(400).json({ error: 'Cannot send request to yourself' });
    }
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ error: 'User not found' });
    }
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
        sender: senderId,
        receiver: receiverId,
        status: 'pending',
    });
    if (existingRequest) {
        return res.status(400).json({ error: 'Request already sent' });
    }
    // Check if already friends
    const existingFriendship = await FriendRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId, status: 'accepted' },
            { sender: receiverId, receiver: senderId, status: 'accepted' },
        ],
    });
    if (existingFriendship) {
        return res.status(400).json({ error: 'Already friends' });
    }
    const request = new FriendRequest({
        sender: senderId,
        receiver: receiverId,
        status: 'pending',
    });
    await request.save();
    res.status(201).json(request);
}));
// Accept friend request
router.post('/:id/accept', authMiddleware, asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const userId = req.user?.id;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    if (request.receiver.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Request already processed' });
    }
    // Update request status
    request.status = 'accepted';
    await request.save();
    // Create conversation
    const conversation = new Conversation({
        members: [request.sender, request.receiver],
    });
    await conversation.save();
    res.json({ request, conversation });
}));
// Reject friend request
router.post('/:id/reject', authMiddleware, asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const userId = req.user?.id;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    if (request.receiver.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Request already processed' });
    }
    request.status = 'rejected';
    await request.save();
    res.json(request);
}));
// Get friends
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const friends = await FriendRequest.find({
        $or: [
            { sender: userId, status: 'accepted' },
            { receiver: userId, status: 'accepted' },
        ],
    })
        .populate('sender', 'username name avatar')
        .populate('receiver', 'username name avatar');
    // Normalize response to return friend data
    const friendsList = friends.map((f) => {
        const friend = f.sender._id.toString() === userId ? f.receiver : f.sender;
        return friend;
    });
    res.json(friendsList);
}));
// Get friend requests (incoming)
router.get('/requests/incoming', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const requests = await FriendRequest.find({
        receiver: userId,
        status: 'pending',
    })
        .populate('sender', 'username name avatar')
        .sort({ createdAt: -1 });
    res.json(requests);
}));
export default router;
