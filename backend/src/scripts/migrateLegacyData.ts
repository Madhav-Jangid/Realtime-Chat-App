import mongoose, { Types } from 'mongoose';
import { connectDb } from '../config/db';
import { UserModel } from '../models/User';
import { FriendRequestModel } from '../models/FriendRequest';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';

interface LegacyFriendRequest {
  user: string;
  isAccepted: boolean;
  date?: string | Date;
}

interface LegacyUser {
  _id: Types.ObjectId;
  clerkId?: string;
  username?: string;
  name?: string;
  email?: string;
  imgUrl?: string;
  avatar?: string;
  bio?: string;
  friendList?: string[];
  friendRequests?: LegacyFriendRequest[];
  createdAt?: string | Date;
  userCreatedOn?: string | Date;
}

interface LegacyChatMessage {
  from: string;
  message: string;
  date?: string | Date;
}

interface LegacyChat {
  _id: Types.ObjectId;
  conversationId?: string;
  participants?: string[];
  conversation?: LegacyChatMessage[];
}

function normalizeUsername(seed: string): string {
  return seed.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'user';
}

async function uniqueUsername(seed: string): Promise<string> {
  const base = normalizeUsername(seed);
  let candidate = base;
  let i = 1;
  while (await UserModel.exists({ username: candidate })) {
    candidate = `${base}${i}`.slice(0, 24);
    i += 1;
  }
  return candidate;
}

function memberKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}

async function run() {
  await connectDb();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database is not connected');
  }

  const legacyUsers = (await db.collection('users').find({}).toArray()) as unknown as LegacyUser[];
  const legacyChats = (await db.collection('chats').find({}).toArray()) as unknown as LegacyChat[];

  const migratedUserByLegacyEmail = new Map<string, string>();
  const migratedUserByClerkId = new Map<string, string>();

  let usersCreated = 0;
  let usersUpdated = 0;

  for (const legacy of legacyUsers) {
    if (!legacy.email) continue;

    const email = legacy.email.toLowerCase();
    let user = await UserModel.findOne({ email });

    if (!user) {
      const baseSeed = legacy.username || legacy.name || email.split('@')[0] || 'user';
      const username = await uniqueUsername(baseSeed);

      user = await UserModel.create({
        username,
        name: legacy.name || username,
        email,
        password: null,
        authProvider: 'clerk',
        clerkId: legacy.clerkId || null,
        avatar: legacy.avatar || legacy.imgUrl || '',
        bio: legacy.bio || '',
        lastActive: new Date()
      });
      usersCreated += 1;
    } else {
      const updateDoc: Record<string, unknown> = {};

      if (!user.username) {
        const seed = legacy.username || legacy.name || email.split('@')[0] || `user_${String(user._id).slice(-6)}`;
        updateDoc.username = await uniqueUsername(seed);
      }
      if (!user.name) {
        updateDoc.name = legacy.name || String(updateDoc.username || user.username || 'User');
      }
      if (!user.clerkId && legacy.clerkId) {
        updateDoc.clerkId = legacy.clerkId;
      }
      if (!user.avatar && (legacy.avatar || legacy.imgUrl)) {
        updateDoc.avatar = legacy.avatar || legacy.imgUrl || '';
      }
      if (!user.authProvider) {
        updateDoc.authProvider = 'clerk';
      }

      if (Object.keys(updateDoc).length > 0) {
        await UserModel.updateOne({ _id: user._id }, { $set: updateDoc });
        usersUpdated += 1;
        user = (await UserModel.findById(user._id))!;
      }
    }

    migratedUserByLegacyEmail.set(email, String(user._id));
    if (legacy.clerkId) migratedUserByClerkId.set(legacy.clerkId, String(user._id));
  }

  let acceptedFriendshipsUpserted = 0;
  let pendingRequestsUpserted = 0;
  const friendshipPairs = new Set<string>();

  for (const legacy of legacyUsers) {
    const fromEmail = legacy.email?.toLowerCase();
    if (!fromEmail) continue;
    const fromUserId = migratedUserByLegacyEmail.get(fromEmail);
    if (!fromUserId) continue;

    for (const friendEmailRaw of legacy.friendList || []) {
      const friendEmail = String(friendEmailRaw || '').toLowerCase();
      const toUserId = migratedUserByLegacyEmail.get(friendEmail);
      if (!toUserId || toUserId === fromUserId) continue;

      const pair = memberKey(fromUserId, toUserId);
      if (friendshipPairs.has(pair)) continue;
      friendshipPairs.add(pair);

      await FriendRequestModel.findOneAndUpdate(
        { sender: fromUserId, receiver: toUserId },
        { $set: { status: 'accepted' } },
        { upsert: true, new: true }
      );
      acceptedFriendshipsUpserted += 1;
    }

    for (const req of legacy.friendRequests || []) {
      if (!req?.user) continue;
      const senderEmail = String(req.user).toLowerCase();
      const senderUserId = migratedUserByLegacyEmail.get(senderEmail);
      if (!senderUserId || senderUserId === fromUserId) continue;

      const status = req.isAccepted ? 'accepted' : 'pending';
      await FriendRequestModel.findOneAndUpdate(
        { sender: senderUserId, receiver: fromUserId },
        { $set: { status } },
        { upsert: true, new: true }
      );
      pendingRequestsUpserted += 1;
    }
  }

  let conversationsCreated = 0;
  for (const pair of friendshipPairs) {
    const [a, b] = pair.split('::');
    const existing = await ConversationModel.findOne({ members: { $all: [a, b], $size: 2 } }).select('_id');
    if (!existing) {
      await ConversationModel.create({ members: [a, b] });
      conversationsCreated += 1;
    }
  }

  let chatsMigrated = 0;
  let messagesMigrated = 0;

  for (const chat of legacyChats) {
    const rawMessages = chat.conversation || [];
    if (!rawMessages.length) continue;

    let memberIds: string[] = [];

    if (Array.isArray(chat.participants) && chat.participants.length >= 2) {
      memberIds = chat.participants
        .map((p) => migratedUserByClerkId.get(p) || migratedUserByLegacyEmail.get(p.toLowerCase()) || '')
        .filter(Boolean);
    }

    if (memberIds.length < 2) {
      const inferred = new Set<string>();
      for (const msg of rawMessages) {
        const from = String(msg.from || '');
        const uid = migratedUserByClerkId.get(from) || migratedUserByLegacyEmail.get(from.toLowerCase());
        if (uid) inferred.add(uid);
      }
      memberIds = [...inferred];
    }

    memberIds = [...new Set(memberIds)].slice(0, 2);
    if (memberIds.length !== 2) continue;

    const [a, b] = memberIds;
    let conversation = await ConversationModel.findOne({ members: { $all: [a, b], $size: 2 } });
    if (!conversation) {
      conversation = await ConversationModel.create({ members: [a, b] });
      conversationsCreated += 1;
    }

    const existingMessageCount = await MessageModel.countDocuments({ conversationId: conversation._id });
    if (existingMessageCount > 0) continue;

    for (const msg of rawMessages) {
      const senderId =
        migratedUserByClerkId.get(String(msg.from || '')) ||
        migratedUserByLegacyEmail.get(String(msg.from || '').toLowerCase()) ||
        a;

      const text = String(msg.message || '').trim();
      if (!text) continue;

      await MessageModel.create({
        conversationId: conversation._id,
        sender: new Types.ObjectId(senderId),
        text,
        seenBy: [new Types.ObjectId(senderId)],
        createdAt: msg.date ? new Date(msg.date) : new Date()
      });

      await ConversationModel.findByIdAndUpdate(conversation._id, {
        lastMessage: text,
        lastMessageAt: msg.date ? new Date(msg.date) : new Date()
      });
      messagesMigrated += 1;
    }

    chatsMigrated += 1;
  }

  console.log('Legacy migration complete');
  console.log({
    legacyUsers: legacyUsers.length,
    legacyChats: legacyChats.length,
    usersCreated,
    usersUpdated,
    acceptedFriendshipsUpserted,
    pendingRequestsUpserted,
    conversationsCreated,
    chatsMigrated,
    messagesMigrated
  });

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Legacy migration failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
