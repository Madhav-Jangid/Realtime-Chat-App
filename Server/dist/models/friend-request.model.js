import mongoose, { Schema } from 'mongoose';
const friendRequestSchema = new Schema({
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
}, {
    timestamps: false,
});
// Prevent duplicate pending requests
friendRequestSchema.index({ sender: 1, receiver: 1, status: 1 }, { unique: false });
friendRequestSchema.index({ receiver: 1, status: 1 });
friendRequestSchema.index({ sender: 1, receiver: 1 });
export const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
