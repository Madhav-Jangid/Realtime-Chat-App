import { Router } from "express";
import { UserService } from "../services/user.service";

const service = new UserService();
export const notificationsRouter = Router();

notificationsRouter.get("/:clerkId", async (req, res) => {
  const notifications = await service.getNotifications(req.params.clerkId);
  res.json({ success: true, data: notifications });
});
