import { describe, it, expect, vi, beforeEach } from "vitest";

const { get, set } = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));
vi.mock("@/lib/db/bento-layout", () => ({
  getBentoLayout: get,
  setBentoLayout: set,
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
    delete process.env.BENTO_LAYOUT_KEY;
  });

  it("GET returns the saved positions wrapped in {positions}", async () => {
    get.mockResolvedValue({ about: { x: 1, y: 2 } });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ positions: { about: { x: 1, y: 2 } } });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("PUT without BENTO_LAYOUT_KEY env returns 500", async () => {
    const res = await PUT(jsonRequest({ positions: {}, key: "anything" }));
    expect(res.status).toBe(500);
  });

  it("PUT with wrong key returns 401", async () => {
    process.env.BENTO_LAYOUT_KEY = "right";
    const res = await PUT(jsonRequest({ positions: {}, key: "wrong" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid key" });
    expect(set).not.toHaveBeenCalled();
  });

  it("PUT with correct key but invalid positions returns 400", async () => {
    process.env.BENTO_LAYOUT_KEY = "right";
    const res = await PUT(
      jsonRequest({ positions: { unknown: { x: 0, y: 0 } }, key: "right" }),
    );
    expect(res.status).toBe(400);
  });

  it("PUT with correct key and valid positions returns 200 and persists", async () => {
    process.env.BENTO_LAYOUT_KEY = "right";
    set.mockResolvedValue({ about: { x: 10, y: 20 } });
    const res = await PUT(
      jsonRequest({ positions: { about: { x: 10, y: 20 } }, key: "right" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ positions: { about: { x: 10, y: 20 } } });
    expect(set).toHaveBeenCalledWith({ about: { x: 10, y: 20 } });
  });

  it("PUT rejects malformed JSON with 400", async () => {
    process.env.BENTO_LAYOUT_KEY = "right";
    const req = new Request("http://localhost/api/bento-layout", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });
});
