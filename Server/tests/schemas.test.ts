import { describe, expect, it } from "vitest";
import { registerUserSchema, sendMessageSchema } from "../src/types/schemas";

describe("request schemas", () => {
  it("validates register user payload", () => {
    const parsed = registerUserSchema.parse({
      clerkId: "user_123",
      name: "Alice",
      email: "alice@example.com"
    });

    expect(parsed.name).toBe("Alice");
  });

  it("rejects empty message", () => {
    const result = sendMessageSchema.safeParse({
      conversationId: "convo-1",
      from: "alice@example.com",
      message: ""
    });

    expect(result.success).toBe(false);
  });
});
