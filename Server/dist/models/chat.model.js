import { Schema, model } from "mongoose";
const messageSchema = new Schema({
    from: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { _id: false });
const chatSchema = new Schema({
    conversationId: { type: String },
    participants: [{ type: String }],
    participantKey: { type: String, unique: true, sparse: true },
    conversation: [messageSchema]
}, { versionKey: false });
export const ChatModel = model("chats", chatSchema);
