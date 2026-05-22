"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildSignedUploadParams, cloudinary, configureCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
}

export async function getUploadCredentials() {
  await requireAdmin();
  return buildSignedUploadParams({ folder: "photos" });
}

const RecordInput = z.object({
  cloudinaryPublicId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
});

export async function recordUploadedPhoto(input: z.infer<typeof RecordInput>) {
  await requireAdmin();
  const data = RecordInput.parse(input);
  await prisma.photo.create({ data });
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (photo) {
    configureCloudinary();
    await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
    await prisma.photo.delete({ where: { id } });
  }
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}
