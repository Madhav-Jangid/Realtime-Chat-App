import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  members: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    members: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: function (v: any) {
          return v.length > 0;
        },
        message: 'Conversation must have at least one member',
      },
    },
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for finding conversations by members
conversationSchema.index({ members: 1 });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
