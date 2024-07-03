// routes/getFriendRequests.js
const express = require('express');
const router = express.Router();
const userModel = require('../models/UserModel');

router.get('/:email', async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'User email is required', status: false });
    }

    try {
        const userDoc = await userModel.findOne({ email });
        if (!userDoc) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        return res.status(200).json({ friendRequests: userDoc.friendRequests, status: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching friend requests: ' + error.message, status: false });
    }
});

module.exports = router;
