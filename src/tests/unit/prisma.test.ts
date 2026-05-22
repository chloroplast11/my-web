import { describe, it, expect } from "vitest";

describe("prisma client singleton", () => {
  it("exports a PrismaClient instance with $connect/$disconnect", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  it("reuses the same instance across imports (HMR-safe)", async () => {
    const a = (await import("@/lib/prisma")).prisma;
    const b = (await import("@/lib/prisma")).prisma;
    expect(a).toBe(b);
  });
});
