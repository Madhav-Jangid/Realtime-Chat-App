import { InferSchemaType, Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    editedAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export type MessageDocument = InferSchemaType<typeof messageSchema> & { _id: string };
export const MessageModel = model('Message', messageSchema);
