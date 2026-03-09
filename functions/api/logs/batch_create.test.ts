import { expect, test, describe, mock, beforeEach } from "bun:test";
import { onRequestPost } from "./batch_create";
import { getSession } from "../auth/me";

// Mock getSession
mock.module("../auth/me", () => ({
  getSession: mock(),
}));

describe("batch_create", () => {
  const mockBind = mock(() => ({}));
  const mockPrepare = mock(() => ({
    bind: mockBind,
  }));
  const mockBatch = mock(() => Promise.resolve([{}, {}]));

  const env = {
    JWT_SECRET: "test-secret",
    DB: {
      prepare: mockPrepare,
      batch: mockBatch,
    },
  };

  beforeEach(() => {
    mockPrepare.mockClear();
    mockBind.mockClear();
    mockBatch.mockClear();
    (getSession as any).mockClear();
  });

  test("should return 401 if user is not authenticated", async () => {
    (getSession as any).mockResolvedValue(null);

    const request = new Request("http://localhost/api/logs/batch_create", {
      method: "POST",
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(401);
  });

  test("should return 400 for invalid JSON body", async () => {
    (getSession as any).mockResolvedValue({ sub: "user123" });

    const request = new Request("http://localhost/api/logs/batch_create", {
      method: "POST",
      body: "invalid json",
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  test("should return 400 for invalid input (missing recorded_date)", async () => {
    (getSession as any).mockResolvedValue({ sub: "user123" });

    const request = new Request("http://localhost/api/logs/batch_create", {
      method: "POST",
      body: JSON.stringify({ items: [{ type: "FOOD", content: "test", calories: 100 }] }),
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("recorded_date");
  });

  test("should successfully create batch logs", async () => {
    (getSession as any).mockResolvedValue({ sub: "user123" });

    const items = [
      { type: "FOOD", content: "Apple", calories: 50 },
      { type: "EXERCISE", name: "Run", calories: 200 },
    ];
    const recorded_date = "2024-05-20";

    const request = new Request("http://localhost/api/logs/batch_create", {
      method: "POST",
      body: JSON.stringify({ items, recorded_date }),
    });

    const response = await onRequestPost({ request, env } as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(2);

    expect(mockPrepare).toHaveBeenCalledTimes(1);
    expect(mockBind).toHaveBeenCalledTimes(2);
    expect(mockBatch).toHaveBeenCalledTimes(1);
  });
});
