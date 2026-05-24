import { Types } from 'mongoose';
import { ConversationModel } from '../../models/Conversation';
import { MessageModel } from '../../models/Message';
import { AppError } from '../../utils/AppError';

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureMembership(userId: string, conversationId: string) {
  const conversation = await ConversationModel.findById(conversationId).select('members');
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.members.map(String).includes(userId)) {
    throw new AppError('Not a conversation member', 403);
  }
}

export async function getMessages(userId: string, conversationId: string, cursor?: string, limit = 20) {
  await ensureMembership(userId, conversationId);

  const query: any = { conversationId: new Types.ObjectId(conversationId) };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const messages = await MessageModel.find(query)
    .sort({ _id: -1 })
    .limit(Math.min(limit, 50))
    .populate('sender', 'username name avatar');

  const hasMore = messages.length === Math.min(limit, 50);
  const nextCursor = hasMore ? String(messages[messages.length - 1]._id) : null;

  return {
    items: messages,
    pageInfo: {
      nextCursor,
      hasMore
    }
  };
}

export async function searchMessages(
  userId: string,
  conversationId: string,
  q: string,
  cursor?: string,
  limit = 20
) {
  await ensureMembership(userId, conversationId);

  const regex = new RegExp(escapeRegex(q.trim()), 'i');
  const query: any = {
    conversationId: new Types.ObjectId(conversationId),
    text: { $regex: regex }
  };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const safeLimit = Math.min(limit, 30);

  const [items, totalCount] = await Promise.all([
    MessageModel.find(query)
      .sort({ _id: -1 })
      .limit(safeLimit)
      .populate('sender', 'username name avatar'),
    MessageModel.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
      text: { $regex: regex }
    })
  ]);

  const hasMore = items.length === safeLimit;
  const nextCursor = hasMore ? String(items[items.length - 1]._id) : null;

  return {
    items,
    totalCount,
    pageInfo: {
      nextCursor,
      hasMore
    }
  };
}
