import { listTags } from "@/lib/db/tags";
import { PostMetaForm } from "@/components/admin/PostMetaForm";
import { createPost } from "@/app/admin/_actions/posts";

export default async function NewPostPage() {
  const tags = await listTags();
  async function submit(v: Parameters<typeof createPost>[0]) {
    "use server";
    await createPost(v);
  }
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">New post</h1>
      <PostMetaForm
        initial={{ title: "", slug: "", language: "en", excerpt: "", coverImageUrl: "", contentJson: undefined, tagIds: [] }}
        allTags={tags}
        onSubmit={submit}
        submitLabel="Create draft"
      />
    </div>
  );
}
