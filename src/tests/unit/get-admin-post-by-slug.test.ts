import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getAdminPostBySlug } from "@/lib/db/posts";

describe("getAdminPostBySlug", () => {
  const slugs: string[] = [];

  afterEach(async () => {
    if (slugs.length) {
      await prisma.post.deleteMany({ where: { slug: { in: slugs } } });
      slugs.length = 0;
    }
  });

  it("returns a draft post by slug", async () => {
    const slug = `t-draft-${Date.now()}`;
    slugs.push(slug);
    await prisma.post.create({
      data: {
        title: "Draft Title", slug, language: "en",
        contentJson: {}, contentHtml: "", status: "draft",
      },
    });
    const out = await getAdminPostBySlug(slug);
    expect(out?.slug).toBe(slug);
    expect(out?.status).toBe("draft");
  });

  it("returns a published post by slug", async () => {
    const slug = `t-pub-${Date.now()}`;
    slugs.push(slug);
    await prisma.post.create({
      data: {
        title: "Pub Title", slug, language: "en",
        contentJson: {}, contentHtml: "", status: "published",
        publishedAt: new Date(),
      },
    });
    const out = await getAdminPostBySlug(slug);
    expect(out?.slug).toBe(slug);
    expect(out?.status).toBe("published");
  });

  it("returns null when no post matches", async () => {
    const out = await getAdminPostBySlug(`missing-${Date.now()}`);
    expect(out).toBeNull();
  });
});
