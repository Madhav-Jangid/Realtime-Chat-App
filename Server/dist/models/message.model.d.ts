import mongoose, { Document, Types } from 'mongoose';
export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    seenBy: Types.ObjectId[];
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
