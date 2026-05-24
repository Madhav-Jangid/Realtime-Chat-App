export interface ChatMessage {
    from: string;
    message: string;
    date: Date;
}
export interface Chat {
    conversationId?: string;
    participants?: string[];
    participantKey?: string;
    conversation: ChatMessage[];
}
export declare const ChatModel: import("mongoose").Model<Chat, {}, {}, {}, import("mongoose").Document<unknown, {}, Chat, {}, {}> & Chat & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
