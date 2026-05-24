import { Router } from "express";
import { UserService } from "../services/user.service";
import { registerUserSchema } from "../types/schemas";
const service = new UserService();
export const usersRouter = Router();
usersRouter.post("/", async (req, res) => {
    const payload = registerUserSchema.parse(req.body);
    const user = await service.registerUser(payload);
    res.status(201).json({ success: true, data: user });
});
usersRouter.get("/:clerkId", async (req, res) => {
    const user = await service.getUser(req.params.clerkId);
    res.json({ success: true, data: user });
});
