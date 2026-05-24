import type { Chat } from "../models/chat.model";
export declare class ChatRepository {
    private participantKey;
    private buildLegacyConversationId;
    private resolveLegacyConversation;
    getOrCreate(conversationId: string): Promise<Chat>;
    getOrCreateByParticipants(participants: string[]): Promise<Chat>;
    appendMessage(params: {
        conversationId: string;
        from: string;
        message: string;
    }): Promise<Chat>;
}
