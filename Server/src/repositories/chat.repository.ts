import { ChatModel } from "../models/chat.model";
import type { Chat } from "../models/chat.model";
import { UserModel } from "../models/user.model";
import { Types } from "mongoose";

export class ChatRepository {
  private participantKey(participants: string[]): string {
    return [...participants].sort().join("::");
  }

  private buildLegacyConversationId(email1: string, email2: string): string {
    return `${email1}${email2}`.split("").sort().join("");
  }

  private async resolveLegacyConversation(conversationId: string): Promise<Chat | null> {
    if (!conversationId.startsWith("convo:")) return null;
    const raw = conversationId.replace("convo:", "");
    const [a, b] = raw.split("::");
    if (!a || !b) return null;
    const users = await UserModel.find({ clerkId: { $in: [a, b] } }).select({ _id: 0, clerkId: 1, email: 1 }).lean();
    if (users.length !== 2) return null;
    const byId = new Map(users.map((u) => [u.clerkId, u.email]));
    const emailA = byId.get(a);
    const emailB = byId.get(b);
    if (!emailA || !emailB) return null;
    const legacyId = this.buildLegacyConversationId(emailA, emailB);
    return ChatModel.findOne({ conversationId: legacyId }).lean();
  }

  async getOrCreate(conversationId: string): Promise<Chat> {
    if (Types.ObjectId.isValid(conversationId)) {
      const byId = await ChatModel.findById(conversationId).lean();
      if (byId) return byId as Chat;
    }

    let convo: Chat | null = (await ChatModel.findOne({ conversationId }).lean()) as Chat | null;
    if (!convo || (convo.conversation?.length ?? 0) === 0) {
      const legacy = await this.resolveLegacyConversation(conversationId);
      if (legacy && (legacy.conversation?.length ?? 0) > 0) {
        if (!convo || (convo.conversation?.length ?? 0) === 0) {
          await ChatModel.findOneAndUpdate(
            { conversationId },
            { $set: { conversationId, conversation: legacy.conversation } },
            { upsert: true, new: true }
          ).lean();
        }
        convo = legacy as Chat;
      }
    }
    if (convo) {
      return convo as Chat;
    }

    const created = await ChatModel.findOneAndUpdate(
      { conversationId },
      { $setOnInsert: { conversationId, conversation: [] } },
      { upsert: true, new: true }
    ).lean();

    return created as Chat;
  }

  async getOrCreateByParticipants(participants: string[]): Promise<Chat> {
    const key = this.participantKey(participants);
    const convo = await ChatModel.findOneAndUpdate(
      { participantKey: key },
      { $setOnInsert: { participants: [...participants].sort(), participantKey: key, conversation: [] } },
      { upsert: true, new: true }
    ).lean();

    return convo as Chat;
  }

  async appendMessage(params: { conversationId: string; from: string; message: string }): Promise<Chat> {
    const filter = Types.ObjectId.isValid(params.conversationId)
      ? { _id: new Types.ObjectId(params.conversationId) }
      : { conversationId: params.conversationId };
    const updated = await ChatModel.findOneAndUpdate(
      filter,
      {
        $push: {
          conversation: {
            from: params.from,
            message: params.message,
            date: new Date()
          }
        },
        $setOnInsert: Types.ObjectId.isValid(params.conversationId)
          ? {}
          : { conversationId: params.conversationId }
      },
      { upsert: true, new: true }
    ).lean();

    return updated as Chat;
  }
}
