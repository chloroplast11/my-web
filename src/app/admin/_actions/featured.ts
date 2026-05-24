"use server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { FeaturedKind } from "@prisma/client";
import {
  addFeatured,
  removeFeatured,
  reorderFeatured,
  toggleFeaturedVisibility,
} from "@/lib/db/featured";

async function requireAdmin() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
}

export async function addFeaturedAction(kind: FeaturedKind, refId: string) {
  await requireAdmin();
  await addFeatured(kind, refId);
  revalidatePath("/admin/featured");
  revalidatePath("/");
}

export async function removeFeaturedAction(id: string) {
  await requireAdmin();
  await removeFeatured(id);
  revalidatePath("/admin/featured");
  revalidatePath("/");
}

export async function reorderFeaturedAction(kind: FeaturedKind, idsInOrder: string[]) {
  await requireAdmin();
  await reorderFeatured(kind, idsInOrder);
  revalidatePath("/admin/featured");
  revalidatePath("/");
}

export async function toggleFeaturedVisibilityAction(id: string) {
  await requireAdmin();
  await toggleFeaturedVisibility(id);
  revalidatePath("/admin/featured");
  revalidatePath("/");
}
