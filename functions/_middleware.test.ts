import { expect, test, describe, mock } from "bun:test";
import { onRequest } from "./_middleware";

// Mock the jose module
mock.module("jose", () => ({
  jwtVerify: mock(),
}));

describe("_middleware", () => {
  const env = { JWT_SECRET: "test-secret" };

  test("should skip verification for excluded paths", async () => {
    const next = mock(() => Promise.resolve(new Response("ok")));
    const request = new Request("http://localhost/verify");
    const response = await onRequest({ request, next, env } as any);
    expect(next).toHaveBeenCalled();
    expect(await response.text()).toBe("ok");
  });

  test("should redirect to /verify if cookie is missing", async () => {
    const next = mock();
    const request = new Request("http://localhost/dashboard");
    const response = await onRequest({ request, next, env } as any);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/verify");
  });

  test("should return 403 for API requests if cookie is missing", async () => {
    const next = mock();
    const request = new Request("http://localhost/api/logs");
    const response = await onRequest({ request, next, env } as any);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe("Human verification required");
  });

  test("should redirect if JWT verification fails", async () => {
    const { jwtVerify } = await import("jose");
    (jwtVerify as any).mockImplementation(() => {
        throw new Error("Invalid token");
    });

    const next = mock();
    const request = new Request("http://localhost/dashboard", {
      headers: { Cookie: "human_verified=invalid" },
    });
    const response = await onRequest({ request, next, env } as any);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/verify");
  });

  test("should call next() if JWT verification succeeds", async () => {
    const { jwtVerify } = await import("jose");
    (jwtVerify as any).mockImplementation(() => {
        return Promise.resolve({ payload: { human_verified: true } });
    });

    const next = mock(() => Promise.resolve(new Response("ok")));
    const request = new Request("http://localhost/dashboard", {
      headers: { Cookie: "human_verified=valid" },
    });
    const response = await onRequest({ request, next, env } as any);
    expect(next).toHaveBeenCalled();
    expect(await response.text()).toBe("ok");
  });
});
