import request from "supertest";
import { describe, expect, it } from "vitest";

describe("health endpoint", () => {
  it("returns ok", async () => {
    process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/test-db";
    process.env.REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
    process.env.REDIS_PORT = process.env.REDIS_PORT ?? "6379";
    process.env.CLERK_API_URL = process.env.CLERK_API_URL ?? "https://api.clerk.com/v1/users";
    process.env.CLERK_API_KEY = process.env.CLERK_API_KEY ?? "test-key";
    const { createApp } = await import("../src/app");
    const app = createApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  }, 15000);
});
