import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bentoLayout: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getBentoLayout, setBentoLayout } from "@/lib/db/bento-layout";

const findUnique = vi.mocked(prisma.bentoLayout.findUnique);
const upsert = vi.mocked(prisma.bentoLayout.upsert);

describe("bento-layout db", () => {
  beforeEach(() => {
    findUnique.mockReset();
    upsert.mockReset();
  });

  it("getBentoLayout returns empty object when no row", async () => {
    findUnique.mockResolvedValue(null);
    expect(await getBentoLayout()).toEqual({});
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "default" } });
  });

  it("getBentoLayout returns parsed positions when row exists", async () => {
    findUnique.mockResolvedValue({
      id: "default",
      positions: { about: { x: 10, y: 20 } },
      updatedAt: new Date(),
    });
    expect(await getBentoLayout()).toEqual({ about: { x: 10, y: 20 } });
  });

  it("getBentoLayout strips unknown card ids from a stored row", async () => {
    findUnique.mockResolvedValue({
      id: "default",
      positions: { about: { x: 1, y: 2 }, mystery: { x: 9, y: 9 } },
      updatedAt: new Date(),
    });
    expect(await getBentoLayout()).toEqual({ about: { x: 1, y: 2 } });
  });

  it("setBentoLayout upserts with id default and returns the saved positions", async () => {
    const positions = { hanabi: { x: 100, y: 200 } };
    upsert.mockResolvedValue({ id: "default", positions, updatedAt: new Date() });
    expect(await setBentoLayout(positions)).toEqual(positions);
    expect(upsert).toHaveBeenCalledWith({
      where: { id: "default" },
      create: { id: "default", positions },
      update: { positions },
    });
  });
});
