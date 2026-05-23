"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderPostHtml } from "@/lib/blocknote/render";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const PostInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  language: z.enum(["en", "zh", "ja"]),
  excerpt: z.preprocess(emptyToNull, z.string().nullable().optional()),
  coverImageUrl: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  contentJson: z.unknown(),
  tagIds: z.array(z.string()).default([]),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createPost(input: z.infer<typeof PostInput>) {
  await requireAdmin();
  const data = PostInput.parse(input);
  const contentHtml = await renderPostHtml(data.contentJson);
  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug || slugify(data.title),
      language: data.language,
      excerpt: data.excerpt ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      contentJson: data.contentJson as object,
      contentHtml,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  });
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePost(id: string, input: z.infer<typeof PostInput>) {
  await requireAdmin();
  const data = PostInput.parse(input);
  const contentHtml = await renderPostHtml(data.contentJson);
  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId: id } }),
    prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        language: data.language,
        excerpt: data.excerpt ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        contentJson: data.contentJson as object,
        contentHtml,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
    }),
  ]);
  revalidatePath("/admin/posts");
  revalidatePath(`/blog/${data.slug}`);
}

export async function publishPost(id: string) {
  await requireAdmin();
  const post = await prisma.post.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function unpublishPost(id: string) {
  await requireAdmin();
  const post = await prisma.post.update({ where: { id }, data: { status: "draft" } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.featured.deleteMany({ where: { kind: "post", refId: id } });
  const post = await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/admin/featured");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/");
  redirect("/admin/posts");
}
