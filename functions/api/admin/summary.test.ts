import { expect, test, describe, mock, beforeEach } from "bun:test";
import { onRequestGet } from "./summary";

// Mock the jose module
mock.module("jose", () => ({
  jwtVerify: mock(),
}));

// Mock the getSession helper
mock.module("../auth/me", () => ({
  getSession: mock(),
}));

describe("Admin Summary API Pagination", () => {
  let env: any;

  beforeEach(async () => {
    const { getSession } = await import("../auth/me");
    (getSession as any).mockReset();
    (getSession as any).mockResolvedValue({ sub: "1", email: "admin@example.com", role: "ADMIN" });

    env = {
      DB: {
        prepare: mock(() => ({
          bind: mock(() => ({
            first: mock(() => Promise.resolve({ count: 100 })),
            all: mock(() => Promise.resolve({ results: [] })),
          })),
          first: mock(() => Promise.resolve({ count: 100 })),
        })),
      },
    };
  });

  test("should use provided limit when it is within reasonable bounds", async () => {
    const request = new Request("http://localhost/api/admin/summary?limit=25&page=1");
    const response = await onRequestGet({ request, env });
    const data = await response.json();

    expect(data.limit).toBe(25);

    // Verify DB call for logs uses the correct limit and offset
    const db = env.DB;
    // expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("LIMIT ? OFFSET ?"));
  });

  test("should cap very large limit values to MAX_LIMIT", async () => {
    const request = new Request("http://localhost/api/admin/summary?limit=1000&page=1");
    const response = await onRequestGet({ request, env });
    const data = await response.json();

    // Now it should be capped at 100
    expect(data.limit).toBe(100);
  });

  test("should ensure page and limit are at least 1", async () => {
    const request = new Request("http://localhost/api/admin/summary?limit=0&page=0");
    const response = await onRequestGet({ request, env });
    const data = await response.json();

    expect(data.page).toBe(1);
    expect(data.limit).toBe(10); // Defaults to 10 if invalid/less than 1
  });

  test("should handle NaN values for page and limit", async () => {
    const request = new Request("http://localhost/api/admin/summary?limit=abc&page=xyz");
    const response = await onRequestGet({ request, env });
    const data = await response.json();

    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
  });
});
