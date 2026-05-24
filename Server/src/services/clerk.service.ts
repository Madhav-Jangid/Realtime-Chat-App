import { AppError } from "../utils/app-error";
import { env } from "../config/env";

export class ClerkService {
  async listUsers() {
    const response = await fetch(env.CLERK_API_URL, {
      headers: {
        Authorization: `Bearer ${env.CLERK_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new AppError(`Clerk API error: ${response.statusText}`, response.status, "CLERK_API_ERROR");
    }

    return response.json();
  }
}
