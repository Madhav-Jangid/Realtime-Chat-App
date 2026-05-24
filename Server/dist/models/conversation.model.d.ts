import mongoose, { Document, Types } from 'mongoose';
export interface IConversation extends Document {
    members: Types.ObjectId[];
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;
}
export declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
