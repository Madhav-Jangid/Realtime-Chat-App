import { InferSchemaType, Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: ['friend.accepted', 'friend.rejected', 'message.new'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', default: null },
    entityId: { type: String, default: null },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: string };
export const NotificationModel = model('Notification', notificationSchema);
