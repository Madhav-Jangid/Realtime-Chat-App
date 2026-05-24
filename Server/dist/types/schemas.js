import { z } from "zod";
export const registerUserSchema = z.object({
    clerkId: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    imgUrl: z.string().url().optional()
});
export const sendFriendRequestSchema = z.object({
    senderClerkId: z.string().min(1),
    receiverClerkId: z.string().min(1),
    senderName: z.string().min(1),
    receiverName: z.string().min(1)
});
export const acceptFriendRequestSchema = z.object({
    senderClerkId: z.string().min(1),
    receiverClerkId: z.string().min(1)
});
export const conversationSchema = z.object({
    conversationId: z.string().min(1).optional(),
    participants: z.array(z.string().min(1)).length(2).optional()
});
export const sendMessageSchema = z.object({
    conversationId: z.string().min(1),
    from: z.string().min(1),
    message: z.string().min(1)
});
