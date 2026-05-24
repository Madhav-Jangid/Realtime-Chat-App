import { AppError } from "../utils/app-error";
import { UserRepository } from "../repositories/user.repository";
import { ClerkService } from "./clerk.service";

const repo = new UserRepository();
const clerkService = new ClerkService();

export class UserService {
  private async buildEmailToClerkMap(): Promise<Map<string, string>> {
    const users = await clerkService.listUsers();
    const map = new Map<string, string>();
    if (Array.isArray(users)) {
      for (const user of users as any[]) {
        const clerkId = user?.id;
        const emails = Array.isArray(user?.email_addresses) ? user.email_addresses : [];
        for (const emailObj of emails) {
          const email = emailObj?.email_address;
          if (email && clerkId) {
            map.set(String(email).toLowerCase(), clerkId);
          }
        }
      }
    }
    return map;
  }

  private normalizeId(value: string, emailToClerk: Map<string, string>): string {
    if (!value) return "";
    if (value.startsWith("user_")) return value;
    return emailToClerk.get(value.toLowerCase()) ?? "";
  }

  async registerUser(input: { clerkId: string; name: string; email: string; imgUrl?: string | undefined }) {
    await repo.findOrCreate(input);
    const user = await repo.findByClerkId(input.clerkId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
  }

  async getUser(clerkId: string) {
    const user = await repo.findByClerkId(clerkId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    const emailToClerk = await this.buildEmailToClerkMap();
    const friendList = (user.friendList ?? []).map((f) => this.normalizeId(f, emailToClerk)).filter(Boolean);
    return { ...user, friendList };
  }

  async getNotifications(clerkId: string) {
    const notifications = await repo.getNotifications(clerkId);
    if (notifications === null) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    const emailToClerk = await this.buildEmailToClerkMap();
    return notifications
      .map((n) => ({ ...n, user: this.normalizeId(n.user, emailToClerk) }))
      .filter((n) => Boolean(n.user));
  }

  async getFriendRequests(clerkId: string) {
    const friendRequests = await repo.getFriendRequests(clerkId);
    if (friendRequests === null) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    const emailToClerk = await this.buildEmailToClerkMap();
    return friendRequests
      .map((f) => ({ ...f, user: this.normalizeId(f.user, emailToClerk) }))
      .filter((f) => Boolean(f.user));
  }

  async sendFriendRequest(input: {
    senderClerkId: string;
    receiverClerkId: string;
    senderName: string;
    receiverName: string;
  }) {
    const result = await repo.addFriendRequest(input);

    if (result === "already_sent") {
      throw new AppError("Friend request already sent", 409, "FRIEND_REQUEST_EXISTS");
    }

    if (result === "receiver_not_found") {
      throw new AppError("Receiver user not found", 404, "USER_NOT_FOUND");
    }

    return { accepted: true };
  }

  async acceptFriendRequest(input: { senderClerkId: string; receiverClerkId: string }) {
    const ok = await repo.acceptFriendRequest(input);
    if (!ok) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return { accepted: true };
  }
}
