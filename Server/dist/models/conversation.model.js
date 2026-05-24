import mongoose, { Schema } from 'mongoose';
const conversationSchema = new Schema({
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: true,
        validate: {
            validator: function (v) {
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
}, {
    timestamps: false,
});
// Index for finding conversations by members
conversationSchema.index({ members: 1 });
export const Conversation = mongoose.model('Conversation', conversationSchema);
