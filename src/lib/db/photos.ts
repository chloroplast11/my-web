import { prisma } from "@/lib/prisma";

export async function listPhotos() {
  return prisma.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { album: { select: { name: true } } },
  });
}
