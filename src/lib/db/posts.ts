import { prisma } from "@/lib/prisma";
import type { Language } from "@prisma/client";

export type PostListItem = Awaited<ReturnType<typeof listPublishedPosts>>[number];

export async function listPublishedPosts(opts: { language?: Language; tagSlugs?: string[] } = {}) {
  return prisma.post.findMany({
    where: {
      status: "published",
      ...(opts.language ? { language: opts.language } : {}),
      ...(opts.tagSlugs?.length
        ? { tags: { some: { tag: { slug: { in: opts.tagSlugs } } } } }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true, excerpt: true, language: true,
      coverImageUrl: true, publishedAt: true,
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: "published" },
    include: { tags: { include: { tag: true } } },
  });
}

export async function listAllAdminPosts() {
  return prisma.post.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true, title: true, slug: true, status: true, language: true,
      publishedAt: true, updatedAt: true,
    },
  });
}

export async function getAdminPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

export async function getAdminPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  });
}
