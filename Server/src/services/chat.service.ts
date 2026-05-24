import { ChatRepository } from "../repositories/chat.repository";

const repo = new ChatRepository();

export class ChatService {
  async getOrCreateConversation(params: { conversationId?: string | undefined; participants?: string[] | undefined }) {
    if (params.participants && params.participants.length === 2) {
      return repo.getOrCreateByParticipants(params.participants);
    }
    if (!params.conversationId) {
      throw new Error("conversationId or participants is required");
    }
    return repo.getOrCreate(params.conversationId);
  }

  async addMessage(input: { conversationId: string; from: string; message: string }) {
    return repo.appendMessage(input);
  }
}
