import { InferSchemaType, Schema, model } from 'mongoose';

const conversationSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

conversationSchema.index({ members: 1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema> & { _id: string };
export const ConversationModel = model('Conversation', conversationSchema);
