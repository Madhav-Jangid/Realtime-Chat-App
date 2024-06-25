const express = require('express');
const router = express.Router();
const chatModel = require('../models/ChatModel.js');

router.post('/', async (req, res) => {
    const { chatId, currentUser, message } = req.body;

    try {
        console.log(chatId, currentUser, message );
        const existingConvo = await chatModel.findOne({ conversationId: chatId });

        if (existingConvo) {
            const updatedConvo = await chatModel.findOneAndUpdate(
                { conversationId: chatId },
                { $push: { conversation: { from: currentUser, message: message } } },
                { new: true }
            );

            return res.json(updatedConvo);
        } else {
            const newConvo = await chatModel.create({
                conversationId: chatId,
                conversation: [{
                    from: currentUser,
                    message: message,
                }],
            });

            return res.json(newConvo);
        }
    } catch (error) {
        console.error('Error creating Message:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
