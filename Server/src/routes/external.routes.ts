import { Router } from "express";
import { ClerkService } from "../services/clerk.service";

const service = new ClerkService();
export const externalRouter = Router();

externalRouter.get("/clerk/users", async (_req, res) => {
  const users = await service.listUsers();
  const safeUsers = (Array.isArray(users) ? users : []).map((user: any) => ({
    id: user.id,
    username: user.username ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    image_url: user.image_url
  }));
  res.json({ success: true, data: safeUsers });
});
