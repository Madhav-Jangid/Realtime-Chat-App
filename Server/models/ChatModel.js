const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const chatSchema = mongoose.Schema({
    conversationId: {
        type: String,
        required: true
    },
    conversation: [messageSchema],
});

const chatModel = mongoose.model('chats', chatSchema);

module.exports = chatModel;
