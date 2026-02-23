import { expect, test, describe, mock } from "bun:test";
import { getSession } from "./me";

// Mock the jose module
mock.module("jose", () => ({
  jwtVerify: mock(),
}));

describe("getSession", () => {
  const env = { JWT_SECRET: "test-secret", DB: {} };

  test("should return null if no cookie header is present", async () => {
    const request = new Request("http://localhost");
    const session = await getSession(request, env as any);
    expect(session).toBeNull();
  });

  test("should return null if auth_token cookie is missing", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "other=value" },
    });
    const session = await getSession(request, env as any);
    expect(session).toBeNull();
  });

  test("should return null if jwtVerify fails", async () => {
    const { jwtVerify } = await import("jose");
    (jwtVerify as any).mockImplementation(() => {
        throw new Error("Invalid token");
    });

    const request = new Request("http://localhost", {
      headers: { Cookie: "auth_token=invalid" },
    });
    const session = await getSession(request, env as any);
    expect(session).toBeNull();
  });

  test("should return user payload if auth_token is valid", async () => {
    const payload = { sub: "123", email: "test@example.com", name: "Test User" };
    const { jwtVerify } = await import("jose");
    (jwtVerify as any).mockImplementation(() => {
        return Promise.resolve({ payload });
    });

    const request = new Request("http://localhost", {
      headers: { Cookie: "auth_token=valid" },
    });
    const session = await getSession(request, env as any);
    expect(session).toEqual(payload as any);
  });

  test("should handle multiple cookies correctly", async () => {
    const payload = { sub: "123", email: "test@example.com", name: "Test User" };
    const { jwtVerify } = await import("jose");
    (jwtVerify as any).mockImplementation(() => {
        return Promise.resolve({ payload });
    });

    const request = new Request("http://localhost", {
      headers: { Cookie: "pref=dark; auth_token=valid; other=123" },
    });
    const session = await getSession(request, env as any);
    expect(session).toEqual(payload as any);
  });
});
