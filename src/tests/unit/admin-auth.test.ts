import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the auth module to avoid loading next-auth dependencies in tests
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { isAdmin } from "@/lib/admin-auth";

describe("isAdmin", () => {
  const originalEnv = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalEnv;
  });

  it("returns true when session email matches ADMIN_EMAIL", () => {
    const s = { user: { email: "admin@example.com" } } as any;
    expect(isAdmin(s)).toBe(true);
  });

  it("returns false when session email differs", () => {
    const s = { user: { email: "other@example.com" } } as any;
    expect(isAdmin(s)).toBe(false);
  });

  it("returns false when session is null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("returns false when session.user is missing", () => {
    const s = {} as any;
    expect(isAdmin(s)).toBe(false);
  });

  it("returns false when ADMIN_EMAIL env is missing", () => {
    delete process.env.ADMIN_EMAIL;
    const s = { user: { email: "admin@example.com" } } as any;
    expect(isAdmin(s)).toBe(false);
  });
});
