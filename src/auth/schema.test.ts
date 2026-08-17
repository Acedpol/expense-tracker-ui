import { describe, expect, it } from "vitest";
import { credentialsSchema } from "./schema";

describe("credentialsSchema", () => {
  it("accepts a valid email and password", () => {
    const result = credentialsSchema.safeParse({ email: "a@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = credentialsSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = credentialsSchema.safeParse({ email: "a@example.com", password: "123" });
    expect(result.success).toBe(false);
  });
});
