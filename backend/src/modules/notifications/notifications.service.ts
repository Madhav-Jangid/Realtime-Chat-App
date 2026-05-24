import { Types } from 'mongoose';
import { NotificationModel } from '../../models/Notification';

type NotificationType = 'friend.accepted' | 'friend.rejected' | 'message.new';

interface CreateNotificationInput {
  recipient: string;
  actorUserId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  conversationId?: string | null;
  entityId?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  return NotificationModel.create({
    recipient: new Types.ObjectId(input.recipient),
    actorUserId: input.actorUserId ? new Types.ObjectId(input.actorUserId) : null,
    type: input.type,
    title: input.title,
    body: input.body,
    conversationId: input.conversationId ? new Types.ObjectId(input.conversationId) : null,
    entityId: input.entityId || null
  });
}

export async function listNotifications(userId: string, cursor?: string, limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const query: any = { recipient: new Types.ObjectId(userId) };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const [items, unreadCount] = await Promise.all([
    NotificationModel.find(query).sort({ _id: -1 }).limit(safeLimit),
    NotificationModel.countDocuments({ recipient: new Types.ObjectId(userId), isRead: false })
  ]);

  const hasMore = items.length === safeLimit;
  const nextCursor = hasMore ? String(items[items.length - 1]._id) : null;

  return {
    items,
    unreadCount,
    pageInfo: { hasMore, nextCursor }
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  const item = await NotificationModel.findOneAndUpdate(
    { _id: new Types.ObjectId(notificationId), recipient: new Types.ObjectId(userId) },
    { $set: { isRead: true } },
    { new: true }
  );

  return item;
}

export async function markAllAsRead(userId: string) {
  const result = await NotificationModel.updateMany(
    { recipient: new Types.ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
  return { updated: result.modifiedCount };
}

export async function deleteNotification(userId: string, notificationId: string) {
  const result = await NotificationModel.findOneAndDelete({
    _id: new Types.ObjectId(notificationId),
    recipient: new Types.ObjectId(userId)
  });
  return { deleted: Boolean(result) };
}
