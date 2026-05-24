import mongoose, { Document, Types } from 'mongoose';
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';
export interface IFriendRequest extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: FriendRequestStatus;
    createdAt: Date;
}
export declare const FriendRequest: mongoose.Model<IFriendRequest, {}, {}, {}, mongoose.Document<unknown, {}, IFriendRequest, {}, {}> & IFriendRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
