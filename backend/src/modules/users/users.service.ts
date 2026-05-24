import { Types } from 'mongoose';
import { FriendRequestModel } from '../../models/FriendRequest';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/AppError';

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}

export async function searchUsers(currentUserId: string, query: string) {
  if (!query?.trim()) {
    return [];
  }

  const regex = new RegExp(query.trim(), 'i');
  const currentObjectId = new Types.ObjectId(currentUserId);

  const [users, acceptedRequests] = await Promise.all([
    UserModel.find({
      _id: { $ne: currentObjectId },
      $or: [{ username: regex }, { name: regex }, { email: regex }]
    })
      .select('username name avatar bio')
      .limit(20),
    FriendRequestModel.find({
      status: 'accepted',
      $or: [{ sender: currentObjectId }, { receiver: currentObjectId }]
    }).select('sender receiver')
  ]);

  const friendIds = new Set(
    acceptedRequests.map((request) =>
      String(request.sender) === currentUserId ? String(request.receiver) : String(request.sender)
    )
  );

  return users.map((user) => ({
    ...user.toObject(),
    isFriend: friendIds.has(String(user._id))
  }));
}
