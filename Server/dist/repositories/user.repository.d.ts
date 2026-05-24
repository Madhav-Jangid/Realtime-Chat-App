export declare class UserRepository {
    private mapEmailsToClerkIds;
    private findEmailByClerkId;
    findByClerkId(clerkId: string): Promise<{
        clerkId: string;
        name: string;
        imgUrl?: string;
        friendList: string[];
    } | null>;
    findOrCreate(input: {
        clerkId: string;
        name: string;
        email: string;
        imgUrl?: string | undefined;
    }): Promise<User>;
    getNotifications(clerkId: string): Promise<Array<{
        user: string;
        message: string;
        date: Date;
        isRead: boolean;
    }> | null>;
    getFriendRequests(clerkId: string): Promise<Array<{
        user: string;
        isAccepted: boolean;
        date: Date;
    }> | null>;
    addFriendRequest(params: {
        senderClerkId: string;
        receiverClerkId: string;
        senderName: string;
        receiverName: string;
    }): Promise<"receiver_not_found" | "already_sent" | "ok">;
    acceptFriendRequest(params: {
        senderClerkId: string;
        receiverClerkId: string;
    }): Promise<boolean>;
}
