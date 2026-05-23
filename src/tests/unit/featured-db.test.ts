import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  listFeatured,
  addFeatured,
  removeFeatured,
  reorderFeatured,
  toggleFeaturedVisibility,
} from "@/lib/db/featured";

describe("featured db helpers", () => {
  beforeEach(async () => {
    await prisma.featured.deleteMany();
  });

  it("addFeatured inserts a row with the next order index per kind", async () => {
    await addFeatured("post", "p1");
    await addFeatured("post", "p2");
    await addFeatured("photo", "ph1");
    const rows = await listFeatured();
    const posts = rows.filter((r) => r.kind === "post");
    expect(posts.map((r) => r.refId)).toEqual(["p1", "p2"]);
    expect(posts[0].order).toBe(0);
    expect(posts[1].order).toBe(1);
    const photos = rows.filter((r) => r.kind === "photo");
    expect(photos[0].order).toBe(0);
  });

  it("reorderFeatured rewrites order for the given kind in input order", async () => {
    const a = await addFeatured("post", "a");
    const b = await addFeatured("post", "b");
    const c = await addFeatured("post", "c");
    await reorderFeatured("post", [c.id, a.id, b.id]);
    const rows = await listFeatured();
    expect(rows.filter((r) => r.kind === "post").map((r) => r.refId)).toEqual(["c", "a", "b"]);
  });

  it("removeFeatured deletes by id", async () => {
    const row = await addFeatured("post", "x");
    await removeFeatured(row.id);
    expect(await prisma.featured.findUnique({ where: { id: row.id } })).toBeNull();
  });

  it("toggleFeaturedVisibility flips isVisible", async () => {
    const row = await addFeatured("post", "x");
    expect(row.isVisible).toBe(true);
    const flipped = await toggleFeaturedVisibility(row.id);
    expect(flipped.isVisible).toBe(false);
  });
});
