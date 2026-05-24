import { InferSchemaType, Schema, model } from 'mongoose';

const friendRequestSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export type FriendRequestDocument = InferSchemaType<typeof friendRequestSchema> & { _id: string };
export const FriendRequestModel = model('FriendRequest', friendRequestSchema);
