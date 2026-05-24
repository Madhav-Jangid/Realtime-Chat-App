import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
    },
    seenBy: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});
// Index for efficient message pagination
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
export const Message = mongoose.model('Message', messageSchema);
