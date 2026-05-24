export declare class ChatService {
    getOrCreateConversation(params: {
        conversationId?: string | undefined;
        participants?: string[] | undefined;
    }): Promise<import("../models/chat.model").Chat>;
    addMessage(input: {
        conversationId: string;
        from: string;
        message: string;
    }): Promise<import("../models/chat.model").Chat>;
}
