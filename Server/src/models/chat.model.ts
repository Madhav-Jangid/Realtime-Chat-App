import { Schema, model } from "mongoose";

export interface ChatMessage {
  from: string;
  message: string;
  date: Date;
}

export interface Chat {
  conversationId?: string;
  participants?: string[];
  participantKey?: string;
  conversation: ChatMessage[];
}

const messageSchema = new Schema<ChatMessage>(
  {
    from: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatSchema = new Schema<Chat>(
  {
    conversationId: { type: String },
    participants: [{ type: String }],
    participantKey: { type: String, unique: true, sparse: true },
    conversation: [messageSchema]
  },
  { versionKey: false }
);

export const ChatModel = model<Chat>("chats", chatSchema);
