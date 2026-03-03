import { expect, test, describe, mock, beforeEach } from "bun:test";
import { onRequestPost } from "./verify-turnstile";

// Mock the jose module
mock.module("jose", () => ({
  SignJWT: class {
    payload: any;
    constructor(payload: any) { this.payload = payload; }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    sign() { return Promise.resolve("mocked-jwt-token"); }
  },
}));

describe("verify-turnstile", () => {
  const env = { TURNSTILE_SECRET_KEY: "test-secret", JWT_SECRET: "jwt-secret" };

  beforeEach(() => {
    // Reset fetch mock before each test if needed
    // In Bun, we can global mock fetch
    global.fetch = mock();
  });

  test("should return 400 if Turnstile verification fails", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] })))
    );

    const request = new Request("http://localhost/api/verify-turnstile", {
      method: "POST",
      body: JSON.stringify({ token: "invalid-token" }),
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid token");
  });

  test("should set signed cookie if Turnstile verification succeeds", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true })))
    );

    const request = new Request("http://localhost/api/verify-turnstile", {
      method: "POST",
      body: JSON.stringify({ token: "valid-token" }),
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).toContain("human_verified=mocked-jwt-token");
    expect(setCookie).toContain("HttpOnly");
  });
});
