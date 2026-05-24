import { Router } from "express";
import { ChatService } from "../services/chat.service";
import { conversationSchema } from "../types/schemas";

const service = new ChatService();
export const conversationsRouter = Router();

conversationsRouter.post("/", async (req, res) => {
  const payload = conversationSchema.parse(req.body);
  const conversation = await service.getOrCreateConversation(payload);

  res.status(201).json({ success: true, data: conversation });
});
