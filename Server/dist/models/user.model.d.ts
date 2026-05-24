import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    lastActive: Date;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
