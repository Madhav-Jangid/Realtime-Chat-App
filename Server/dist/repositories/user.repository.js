import { UserModel } from "../models/user.model";
export class UserRepository {
    async mapEmailsToClerkIds(emails) {
        if (emails.length === 0)
            return [];
        const users = await UserModel.find({ email: { $in: emails } }).select({ _id: 0, email: 1, clerkId: 1 }).lean();
        const byEmail = new Map(users.map((u) => [u.email, u.clerkId]));
        return emails.map((email) => byEmail.get(email)).filter((id) => Boolean(id));
    }
    async findEmailByClerkId(clerkId) {
        const user = await UserModel.findOne({ clerkId }).select({ _id: 0, email: 1 }).lean();
        return user?.email ?? null;
    }
    async findByClerkId(clerkId) {
        const user = await UserModel.findOne({ clerkId })
            .select({ _id: 0, clerkId: 1, name: 1, imgUrl: 1, friendList: 1 })
            .lean();
        if (!user)
            return null;
        const friendList = await this.mapEmailsToClerkIds(user.friendList ?? []);
        return {
            clerkId: user.clerkId,
            name: user.name,
            ...(user.imgUrl ? { imgUrl: user.imgUrl } : {}),
            friendList
        };
    }
    async findOrCreate(input) {
        const user = await UserModel.findOneAndUpdate({ $or: [{ clerkId: input.clerkId }, { email: input.email }] }, {
            $set: {
                clerkId: input.clerkId,
                name: input.name,
                imgUrl: input.imgUrl
            },
            $setOnInsert: {
                email: input.email,
                userCreatedOn: new Date(),
                friendList: [],
                friendRequests: [],
                groupRequests: [],
                notifications: []
            }
        }, { new: true, upsert: true }).lean();
        return user;
    }
    async getNotifications(clerkId) {
        const user = await UserModel.findOne({ clerkId }).select({ _id: 0, notifications: 1 }).lean();
        if (!user)
            return null;
        const notifyUsers = (user.notifications ?? []).map((n) => n.user);
        const mapped = await UserModel.find({ email: { $in: notifyUsers } }).select({ _id: 0, email: 1, clerkId: 1 }).lean();
        const byEmail = new Map(mapped.map((u) => [u.email, u.clerkId]));
        return (user.notifications ?? []).map((n) => ({
            ...n,
            user: byEmail.get(n.user) ?? ""
        }));
    }
    async getFriendRequests(clerkId) {
        const user = await UserModel.findOne({ clerkId }).select({ _id: 0, friendRequests: 1 }).lean();
        if (!user)
            return null;
        const reqUsers = (user.friendRequests ?? []).map((r) => r.user);
        const mapped = await UserModel.find({ email: { $in: reqUsers } }).select({ _id: 0, email: 1, clerkId: 1 }).lean();
        const byEmail = new Map(mapped.map((u) => [u.email, u.clerkId]));
        return (user.friendRequests ?? []).map((r) => ({
            ...r,
            user: byEmail.get(r.user) ?? ""
        }));
    }
    async addFriendRequest(params) {
        const senderEmail = await this.findEmailByClerkId(params.senderClerkId);
        const receiverEmail = await this.findEmailByClerkId(params.receiverClerkId);
        if (!senderEmail || !receiverEmail) {
            return "receiver_not_found";
        }
        const senderUpdate = await UserModel.updateOne({
            email: senderEmail,
            "notifications.user": { $ne: receiverEmail }
        }, {
            $push: {
                notifications: {
                    user: receiverEmail,
                    message: `Friend request sent to ${params.receiverName}`,
                    date: new Date(),
                    isRead: false
                }
            }
        });
        if (senderUpdate.matchedCount === 0) {
            return "already_sent";
        }
        const receiverUpdate = await UserModel.updateOne({ email: receiverEmail }, {
            $push: {
                friendRequests: {
                    user: senderEmail,
                    isAccepted: false,
                    date: new Date()
                },
                notifications: {
                    user: senderEmail,
                    message: `${params.senderName} has sent you a friend request.`,
                    date: new Date(),
                    isRead: false
                }
            }
        });
        if (receiverUpdate.matchedCount === 0) {
            await UserModel.updateOne({ email: senderEmail }, { $pull: { notifications: { user: receiverEmail } } });
            return "receiver_not_found";
        }
        return "ok";
    }
    async acceptFriendRequest(params) {
        const senderEmail = await this.findEmailByClerkId(params.senderClerkId);
        const receiverEmail = await this.findEmailByClerkId(params.receiverClerkId);
        if (!senderEmail || !receiverEmail) {
            return false;
        }
        const [senderUpdate, receiverUpdate] = await Promise.all([
            UserModel.updateOne({ email: senderEmail }, { $addToSet: { friendList: receiverEmail } }),
            UserModel.updateOne({ email: receiverEmail }, {
                $addToSet: { friendList: senderEmail },
                $pull: { friendRequests: { user: senderEmail } }
            })
        ]);
        return senderUpdate.matchedCount > 0 && receiverUpdate.matchedCount > 0;
    }
}
