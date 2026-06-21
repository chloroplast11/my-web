import { prisma } from "@/lib/prisma";

const ROW_ID = "default";

export async function getSiteLikeCount(): Promise<number> {
  const row = await prisma.siteLike.findUnique({ where: { id: ROW_ID } });
  return row?.count ?? 0;
}

export async function incrementSiteLike(): Promise<number> {
  const row = await prisma.siteLike.upsert({
    where: { id: ROW_ID },
    update: { count: { increment: 1 } },
    create: { id: ROW_ID, count: 1 },
  });
  return row.count;
}
