import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listTags } from "@/lib/db/tags";
import { PostMetaForm } from "@/components/admin/PostMetaForm";
import { createPost } from "@/app/admin/_actions/posts";

export default async function WritePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const tags = await listTags();

  async function submit(v: Parameters<typeof createPost>[0]) {
    "use server";
    await createPost(v, { redirectTo: "preview" });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="font-serif text-3xl mb-6">Write</h1>
      <PostMetaForm
        initial={{ title: "", slug: "", language: "en", excerpt: "", coverImageUrl: "", contentJson: undefined, tagIds: [] }}
        allTags={tags}
        onSubmit={submit}
        submitLabel="Save draft"
      />
    </main>
  );
}
