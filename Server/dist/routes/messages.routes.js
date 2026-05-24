import { Router } from "express";
import { ChatService } from "../services/chat.service";
import { sendMessageSchema } from "../types/schemas";
const service = new ChatService();
export const messagesRouter = Router();
messagesRouter.post("/", async (req, res) => {
    const payload = sendMessageSchema.parse(req.body);
    const conversation = await service.addMessage(payload);
    res.status(201).json({ success: true, data: conversation });
});
