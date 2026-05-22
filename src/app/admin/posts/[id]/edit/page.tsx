import { listTags } from "@/lib/db/tags";
import { getAdminPostById } from "@/lib/db/posts";
import { PostMetaForm } from "@/components/admin/PostMetaForm";
import { updatePost, publishPost, unpublishPost, deletePost } from "@/app/admin/_actions/posts";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, tags] = await Promise.all([getAdminPostById(id), listTags()]);
  if (!post) notFound();

  async function submit(v: Parameters<typeof updatePost>[1]) {
    "use server";
    await updatePost(id, v);
  }

  const publishAction = async () => {
    "use server";
    await publishPost(id);
  };
  const unpublishAction = async () => {
    "use server";
    await unpublishPost(id);
  };
  const deleteAction = async () => {
    "use server";
    await deletePost(id);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="font-serif text-3xl">Edit post</h1>
        <div className="flex gap-3 text-sm">
          {post.status === "published" ? (
            <>
              <Link href={`/blog/${post.slug}`} className="text-muted hover:text-ink">View ↗</Link>
              <form action={unpublishAction}>
                <button className="text-muted hover:text-ink">Unpublish</button>
              </form>
            </>
          ) : (
            <form action={publishAction}>
              <button className="text-accent">Publish</button>
            </form>
          )}
          <form action={deleteAction}>
            <button className="text-red-700">Delete</button>
          </form>
        </div>
      </header>

      <PostMetaForm
        initial={{
          title: post.title,
          slug: post.slug,
          language: post.language as "en" | "zh" | "ja",
          excerpt: post.excerpt ?? "",
          coverImageUrl: post.coverImageUrl ?? "",
          contentJson: post.contentJson,
          tagIds: post.tags.map((t) => t.tagId),
        }}
        allTags={tags}
        onSubmit={submit}
        submitLabel="Save"
      />
    </div>
  );
}
