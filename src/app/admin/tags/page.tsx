import { listTagsWithPostCount } from "@/lib/db/tags";
import { createTag, deleteTag } from "@/app/admin/_actions/tags";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function TagsPage() {
  const tags = await listTagsWithPostCount();
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Tags</h1>
      <form action={createTag} className="flex gap-2">
        <input name="name" required placeholder="New tag name" className="border border-line p-2 rounded flex-1" />
        <button className="px-4 py-2 bg-ink text-paper rounded">Create</button>
      </form>
      <ul className="divide-y divide-line">
        {tags.map((t) => (
          <li key={t.id} className="flex justify-between py-3">
            <div>
              <span className="font-medium">{t.name}</span>
              <span className="text-muted text-sm ml-3">{t._count.posts} posts</span>
            </div>
            <DeleteButton
              action={async () => { "use server"; await deleteTag(t.id); }}
              itemLabel={t.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
