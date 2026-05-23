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

export async function createAlbum(formData: FormData) {
  await requireAdmin();
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.album.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/albums");
  revalidatePath("/photos");
}

export async function assignPhotoToAlbum(photoId: string, albumId: string | null) {
  await requireAdmin();
  await prisma.photo.update({ where: { id: photoId }, data: { albumId } });
  revalidatePath("/photos");
}
