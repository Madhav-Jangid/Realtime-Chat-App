import { Router } from "express";
import { UserService } from "../services/user.service";
import { acceptFriendRequestSchema, sendFriendRequestSchema } from "../types/schemas";
const service = new UserService();
export const friendsRouter = Router();
friendsRouter.post("/requests", async (req, res) => {
    const payload = sendFriendRequestSchema.parse(req.body);
    const result = await service.sendFriendRequest(payload);
    res.status(201).json({ success: true, data: result });
});
friendsRouter.get("/requests/:clerkId", async (req, res) => {
    const data = await service.getFriendRequests(req.params.clerkId);
    res.json({ success: true, data });
});
friendsRouter.post("/requests/accept", async (req, res) => {
    const payload = acceptFriendRequestSchema.parse(req.body);
    const result = await service.acceptFriendRequest(payload);
    res.json({ success: true, data: result });
});
