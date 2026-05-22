"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
}

export async function createTag(formData: FormData) {
  await requireAdmin();
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.tag.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}
