import { prisma } from "@/lib/prisma";
import { layoutReadSchema, type Layout } from "@/lib/bento-defaults";

const LAYOUT_ID = "default";

export async function getBentoLayout(): Promise<Layout> {
  const row = await prisma.bentoLayout.findUnique({ where: { id: LAYOUT_ID } });
  if (!row) return {};
  const parsed = layoutReadSchema.safeParse(row.positions);
  return parsed.success ? parsed.data : {};
}

export async function setBentoLayout(positions: Layout): Promise<Layout> {
  const row = await prisma.bentoLayout.upsert({
    where: { id: LAYOUT_ID },
    create: { id: LAYOUT_ID, positions },
    update: { positions },
  });
  const parsed = layoutReadSchema.safeParse(row.positions);
  return parsed.success ? parsed.data : positions;
}
