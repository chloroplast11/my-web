import { describe, it, expect, vi, beforeEach } from "vitest";

const { get, set, authMock } = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  authMock: vi.fn(),
}));
vi.mock("@/lib/db/bento-layout", () => ({
  getBentoLayout: get,
  setBentoLayout: set,
}));
vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

import { GET, PUT } from "@/app/api/bento-layout/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/bento-layout", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/bento-layout", () => {
  beforeEach(() => {
    get.mockReset();
    set.mockReset();
    authMock.mockReset();
  });

  it("GET returns the saved positions wrapped in {positions}", async () => {
    get.mockResolvedValue({ about: { x: 1, y: 2 } });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ positions: { about: { x: 1, y: 2 } } });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("PUT without a session returns 401 and does not write", async () => {
    authMock.mockResolvedValue(null);
    const res = await PUT(jsonRequest({ positions: {} }));
    expect(res.status).toBe(401);
    expect(set).not.toHaveBeenCalled();
  });

  it("PUT with a session but invalid positions returns 400", async () => {
    authMock.mockResolvedValue({ user: { id: "u1" } });
    const res = await PUT(
      jsonRequest({ positions: { unknown: { x: 0, y: 0 } } }),
    );
    expect(res.status).toBe(400);
    expect(set).not.toHaveBeenCalled();
  });

  it("PUT with a session and valid positions returns 200 and persists", async () => {
    authMock.mockResolvedValue({ user: { id: "u1" } });
    set.mockResolvedValue({ about: { x: 10, y: 20 } });
    const res = await PUT(
      jsonRequest({ positions: { about: { x: 10, y: 20 } } }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ positions: { about: { x: 10, y: 20 } } });
    expect(set).toHaveBeenCalledWith({ about: { x: 10, y: 20 } });
  });

  it("PUT rejects malformed JSON with 400", async () => {
    authMock.mockResolvedValue({ user: { id: "u1" } });
    const req = new Request("http://localhost/api/bento-layout", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });
});
