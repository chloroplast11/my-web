"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
  blurhash: z.string().nullable().optional(),
  blurDataUrl: z.string().nullable().optional(),
  exif: z.record(z.string(), z.unknown()).nullable().optional(),
  takenAt: z.coerce.date().nullable().optional(),
  albumId: z.string().nullable().optional(),
});

export async function recordUploadedPhoto(input: z.infer<typeof RecordInput>) {
  await requireAdmin();
  const data = RecordInput.parse(input);
  await prisma.photo.create({
    data: {
      cloudinaryPublicId: data.cloudinaryPublicId,
      width: data.width,
      height: data.height,
      caption: data.caption,
      blurhash: data.blurhash ?? null,
      blurDataUrl: data.blurDataUrl ?? null,
      exif: (data.exif ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
      takenAt: data.takenAt ?? null,
      albumId: data.albumId ?? null,
    },
  });
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}

export async function processBlobForUpload(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("missing file");
  const buf = Buffer.from(await file.arrayBuffer());
  const { processImage } = await import("@/lib/image-processing");
  return await processImage(buf);
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
