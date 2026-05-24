import { ConversationModel } from '../../models/Conversation';
import { MessageModel } from '../../models/Message';
import { AppError } from '../../utils/AppError';

export async function listUserConversations(userId: string) {
  const conversations = await ConversationModel.find({ members: userId })
    .populate('members', 'username name avatar')
    .sort({ lastMessageAt: -1, createdAt: -1 });

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await MessageModel.countDocuments({
        conversationId: conversation._id,
        sender: { $ne: userId },
        seenBy: { $ne: userId }
      });

      return {
        ...conversation.toObject(),
        unreadCount
      };
    })
  );

  return enriched;
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conversation = await ConversationModel.findById(conversationId).select('members');
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.members.map(String).includes(userId)) {
    throw new AppError('Not a conversation member', 403);
  }

  await Promise.all([
    MessageModel.deleteMany({ conversationId: conversation._id }),
    ConversationModel.deleteOne({ _id: conversation._id })
  ]);

  return { conversationId, deleted: true };
}
