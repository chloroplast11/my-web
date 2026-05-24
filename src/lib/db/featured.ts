import { prisma } from "@/lib/prisma";
import type { FeaturedKind } from "@prisma/client";

export async function listFeatured() {
  return prisma.featured.findMany({
    orderBy: [{ kind: "asc" }, { order: "asc" }],
  });
}

export async function addFeatured(kind: FeaturedKind, refId: string) {
  const last = await prisma.featured.findFirst({
    where: { kind },
    orderBy: { order: "desc" },
  });
  return prisma.featured.create({
    data: { kind, refId, order: (last?.order ?? -1) + 1 },
  });
}

export async function removeFeatured(id: string) {
  await prisma.featured.delete({ where: { id } });
}

export async function reorderFeatured(kind: FeaturedKind, idsInOrder: string[]) {
  await prisma.$transaction(
    idsInOrder.map((id, idx) =>
      prisma.featured.update({ where: { id }, data: { order: idx } }),
    ),
  );
}

export async function toggleFeaturedVisibility(id: string) {
  const row = await prisma.featured.findUniqueOrThrow({ where: { id } });
  return prisma.featured.update({
    where: { id },
    data: { isVisible: !row.isVisible },
  });
}

export async function listVisibleFeaturedPosts(limit = 3) {
  const rows = await prisma.featured.findMany({
    where: { kind: "post", isVisible: true },
    orderBy: { order: "asc" },
    take: limit,
  });
  if (rows.length === 0) return [];
  const posts = await prisma.post.findMany({
    where: { id: { in: rows.map((r) => r.refId) }, status: "published" },
    select: {
      id: true, slug: true, title: true, excerpt: true, language: true,
      coverImageUrl: true, publishedAt: true,
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
  const byId = new Map(posts.map((p) => [p.id, p]));
  return rows.map((r) => byId.get(r.refId)).filter(Boolean) as typeof posts;
}

export async function listVisibleFeaturedPhotos(limit = 6) {
  const rows = await prisma.featured.findMany({
    where: { kind: "photo", isVisible: true },
    orderBy: { order: "asc" },
    take: limit,
  });
  if (rows.length === 0) return [];
  const photos = await prisma.photo.findMany({
    where: { id: { in: rows.map((r) => r.refId) } },
    include: { album: { select: { name: true } } },
  });
  const byId = new Map(photos.map((p) => [p.id, p]));
  return rows.map((r) => byId.get(r.refId)).filter(Boolean) as typeof photos;
}
