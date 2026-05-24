import mongoose, { Schema, Document, Types } from 'mongoose';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface IFriendRequest extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
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

// Prevent duplicate pending requests
friendRequestSchema.index({ sender: 1, receiver: 1, status: 1 }, { unique: false });
friendRequestSchema.index({ receiver: 1, status: 1 });
friendRequestSchema.index({ sender: 1, receiver: 1 });

export const FriendRequest = mongoose.model<IFriendRequest>(
  'FriendRequest',
  friendRequestSchema
);
