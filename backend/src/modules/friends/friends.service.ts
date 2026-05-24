import { Types } from 'mongoose';
import { ConversationModel } from '../../models/Conversation';
import { FriendRequestModel } from '../../models/FriendRequest';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/AppError';
import { createNotification } from '../notifications/notifications.service';

export async function sendRequest(currentUserId: string, receiverId: string) {
  if (currentUserId === receiverId) {
    throw new AppError('Cannot send friend request to yourself', 400);
  }

  const receiver = await UserModel.findById(receiverId);
  if (!receiver) {
    throw new AppError('Receiver not found', 404);
  }

  const existing = await FriendRequestModel.findOne({
    $or: [
      { sender: currentUserId, receiver: receiverId },
      { sender: receiverId, receiver: currentUserId }
    ]
  });

  if (existing?.status === 'accepted') {
    throw new AppError('Users are already friends', 409);
  }

  if (existing?.status === 'pending') {
    throw new AppError('A pending request already exists', 409);
  }

  if (existing?.status === 'rejected') {
    existing.sender = new Types.ObjectId(currentUserId);
    existing.receiver = new Types.ObjectId(receiverId);
    existing.status = 'pending';
    await existing.save();
    return existing;
  }

  return FriendRequestModel.create({ sender: currentUserId, receiver: receiverId, status: 'pending' });
}

export async function acceptRequest(currentUserId: string, requestId: string) {
  const request = await FriendRequestModel.findById(requestId);
  if (!request) {
    throw new AppError('Friend request not found', 404);
  }

  if (String(request.receiver) !== currentUserId) {
    throw new AppError('Only receiver can accept this request', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('Request is already handled', 400);
  }

  request.status = 'accepted';
  await request.save();

  let conversation = await ConversationModel.findOne({
    members: { $all: [request.sender, request.receiver], $size: 2 }
  });

  if (!conversation) {
    conversation = await ConversationModel.create({
      members: [request.sender, request.receiver]
    });
  }

  const receiverUser = await UserModel.findById(request.receiver).select('username name');

  const receiverName = receiverUser?.username || receiverUser?.name || 'A friend';
  try {
    await createNotification({
      recipient: String(request.sender),
      actorUserId: String(request.receiver),
      type: 'friend.accepted',
      title: 'Friend request accepted',
      body: `${receiverName} accepted your friend request.`,
      conversationId: String(conversation._id),
      entityId: String(request._id)
    });
  } catch (_error) {
    // Non-blocking side effect.
  }

  return { request, conversation };
}

export async function rejectRequest(currentUserId: string, requestId: string) {
  const request = await FriendRequestModel.findById(requestId);
  if (!request) {
    throw new AppError('Friend request not found', 404);
  }

  if (String(request.receiver) !== currentUserId) {
    throw new AppError('Only receiver can reject this request', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('Request is already handled', 400);
  }

  request.status = 'rejected';
  await request.save();

  const receiverUser = await UserModel.findById(request.receiver).select('username name');
  const receiverName = receiverUser?.username || receiverUser?.name || 'A user';
  try {
    await createNotification({
      recipient: String(request.sender),
      actorUserId: String(request.receiver),
      type: 'friend.rejected',
      title: 'Friend request rejected',
      body: `${receiverName} rejected your friend request.`,
      entityId: String(request._id)
    });
  } catch (_error) {
    // Non-blocking side effect.
  }

  return request;
}

export async function listFriends(currentUserId: string) {
  const accepted = await FriendRequestModel.find({
    status: 'accepted',
    $or: [{ sender: currentUserId }, { receiver: currentUserId }]
  }).populate('sender receiver', 'username name avatar bio');

  return accepted.map((item) => {
    const isSender = String((item.sender as any)._id) === currentUserId;
    return isSender ? item.receiver : item.sender;
  });
}

export async function listRequests(currentUserId: string) {
  return FriendRequestModel.find({ receiver: currentUserId, status: 'pending' })
    .populate('sender', 'username name avatar bio')
    .sort({ createdAt: -1 });
}

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const request = await FriendRequestModel.findOne({
    status: 'accepted',
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA }
    ]
  }).select('_id');

  return Boolean(request);
}

export async function unfriend(currentUserId: string, friendId: string) {
  if (currentUserId === friendId) {
    throw new AppError('Invalid friend id', 400);
  }

  const request = await FriendRequestModel.findOneAndDelete({
    status: 'accepted',
    $or: [
      { sender: currentUserId, receiver: friendId },
      { sender: friendId, receiver: currentUserId }
    ]
  });

  if (!request) {
    throw new AppError('Friend relation not found', 404);
  }

  return { friendId, removed: true };
}
