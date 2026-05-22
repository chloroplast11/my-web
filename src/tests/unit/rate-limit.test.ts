import { describe, it, expect, beforeEach, vi } from "vitest";
import { check, _resetForTest } from "@/lib/rate-limit";

describe("rate limit", () => {
  beforeEach(() => { _resetForTest(); });

  it("allows up to N attempts per window", () => {
    for (let i = 0; i < 5; i++) expect(check("a", 5, 60_000).ok).toBe(true);
    expect(check("a", 5, 60_000).ok).toBe(false);
  });

  it("isolates keys", () => {
    for (let i = 0; i < 5; i++) check("a", 5, 60_000);
    expect(check("b", 5, 60_000).ok).toBe(true);
  });

  it("resets after window passes", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) check("a", 5, 1000);
    expect(check("a", 5, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(check("a", 5, 1000).ok).toBe(true);
    vi.useRealTimers();
  });
});
