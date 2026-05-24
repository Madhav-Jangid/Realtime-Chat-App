import { ChatRepository } from "../repositories/chat.repository";
const repo = new ChatRepository();
export class ChatService {
    async getOrCreateConversation(params) {
        if (params.participants && params.participants.length === 2) {
            return repo.getOrCreateByParticipants(params.participants);
        }
        if (!params.conversationId) {
            throw new Error("conversationId or participants is required");
        }
        return repo.getOrCreate(params.conversationId);
    }
    async addMessage(input) {
        return repo.appendMessage(input);
    }
}
