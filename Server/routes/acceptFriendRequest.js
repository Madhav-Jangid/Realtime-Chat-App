// routes/acceptFriendRequest.js
const express = require('express');
const router = express.Router();
const userModel = require('../models/UserModel');

router.post('/accept', async (req, res) => {
    const { user, to } = req.body;
    if (!user || !to) {
        return res.status(400).json({ message: 'Sender and receiver emails are required', status: false });
    }

    try {
        // Find the sender
        const senderDoc = await userModel.findOne({ email: user });
        if (!senderDoc) {
            return res.status(404).json({ message: 'Sender user not found', status: false });
        }

        // Find the receiver
        const receiverDoc = await userModel.findOne({ email: to });
        if (!receiverDoc) {
            return res.status(404).json({ message: 'Receiver user not found', status: false });
        }

        // Add each user's email to the other's friendList array
        if (!senderDoc.friendList.includes(to)) {
            senderDoc.friendList.push(to);
        }
        if (!receiverDoc.friendList.includes(user)) {
            receiverDoc.friendList.push(user);
        }

        // Remove the friend request from the receiver's friendRequests array
        receiverDoc.friendRequests = receiverDoc.friendRequests.filter(request => request.user !== user);

        // Save both documents
        await senderDoc.save();
        await receiverDoc.save();

        return res.status(200).json({ message: 'Friend request accepted and friend lists updated', status: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error accepting friend request: ' + error.message, status: false });
    }
});

module.exports = router;
