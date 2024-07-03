const express = require('express');
const router = express.Router();
const userModel = require('../models/UserModel');

router.post('/', async (req, res) => {
    const { user, isAccepted, to, username, sendername } = req.body;
    if (!user || !to) {
        return res.status(400).json({ message: 'Sender and receiver emails are required', status: false });
    }

    try {
        // Find the sender
        const senderDoc = await userModel.findOne({ email: user });
        if (!senderDoc) {
            return res.status(404).json({ message: 'Sender user not found', status: false });
        }

        // Check if the friend request already exists in sender's notifications
        const existingRequest = senderDoc.notifications.find(notification => notification.user === to);
        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent', already: true, status: false });
        }

        // Add a notification to the sender's document
        senderDoc.notifications.push({
            user: to,
            message: `Friend request sent to ${sendername}`,
            date: new Date(),
            isRead: false
        });

        // Save the sender document
        await senderDoc.save();

        // Find the receiver
        const receiverDoc = await userModel.findOne({ email: to });
        if (!receiverDoc) {
            return res.status(404).json({ message: 'Receiver user not found', status: false });
        }

        // Add the friend request to the receiver's friendRequests array
        receiverDoc.friendRequests.push({
            user: user,
            isAccepted: isAccepted || false,
            date: new Date()
        });

        // Add the notification to the receiver's notifications array
        receiverDoc.notifications.push({
            user: user,
            message: `${username} has sent you a friend request.`,
            date: new Date(),
            isRead: false
        });

        // Save the receiver document
        await receiverDoc.save();

        return res.status(200).json({ message: 'Friend request and notification added successfully', status: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding friend request: ' + error.message, status: false });
    }
});

module.exports = router;
