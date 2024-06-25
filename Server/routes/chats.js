const express = require('express');
const router = express.Router();
const chatModel = require('../models/ChatModel.js');

router.post('/', async (req, res) => {
    const { conversationId } = req.body;
    console.log(conversationId);
    if (!conversationId) {
        return res.status(400).json({ message: 'conversationId is required' });
    }

    try {
        let convo = await chatModel.findOne({ conversationId: conversationId });

        if (convo) {
            return res.status(200).json(convo);
        }

        convo = new chatModel({
            conversationId,
        });

        const newConvo = await convo.save();
        return res.status(201).json(newConvo);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
