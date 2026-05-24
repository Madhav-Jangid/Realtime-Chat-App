export declare class UserService {
    private buildEmailToClerkMap;
    private normalizeId;
    registerUser(input: {
        clerkId: string;
        name: string;
        email: string;
        imgUrl?: string | undefined;
    }): Promise<{
        clerkId: string;
        name: string;
        imgUrl?: string;
        friendList: string[];
    }>;
    getUser(clerkId: string): Promise<{
        friendList: string[];
        clerkId: string;
        name: string;
        imgUrl?: string;
    }>;
    getNotifications(clerkId: string): Promise<{
        user: string;
        message: string;
        date: Date;
        isRead: boolean;
    }[]>;
    getFriendRequests(clerkId: string): Promise<{
        user: string;
        isAccepted: boolean;
        date: Date;
    }[]>;
    sendFriendRequest(input: {
        senderClerkId: string;
        receiverClerkId: string;
        senderName: string;
        receiverName: string;
    }): Promise<{
        accepted: boolean;
    }>;
    acceptFriendRequest(input: {
        senderClerkId: string;
        receiverClerkId: string;
    }): Promise<{
        accepted: boolean;
    }>;
}
