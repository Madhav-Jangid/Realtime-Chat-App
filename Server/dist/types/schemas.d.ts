import { z } from "zod";
export declare const registerUserSchema: z.ZodObject<{
    clerkId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    imgUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const sendFriendRequestSchema: z.ZodObject<{
    senderClerkId: z.ZodString;
    receiverClerkId: z.ZodString;
    senderName: z.ZodString;
    receiverName: z.ZodString;
}, z.core.$strip>;
export declare const acceptFriendRequestSchema: z.ZodObject<{
    senderClerkId: z.ZodString;
    receiverClerkId: z.ZodString;
}, z.core.$strip>;
export declare const conversationSchema: z.ZodObject<{
    conversationId: z.ZodOptional<z.ZodString>;
    participants: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const sendMessageSchema: z.ZodObject<{
    conversationId: z.ZodString;
    from: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
