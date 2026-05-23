import Link from "next/link";
import { listAllAdminPosts } from "@/lib/db/posts";
import { cn } from "@/lib/cn";
import { deletePost } from "@/app/admin/_actions/posts";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function AdminPostsPage() {
  const posts = await listAllAdminPosts();
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="font-serif text-3xl">Posts</h1>
        <Link href="/admin/posts/new" className="px-4 py-2 rounded-full bg-ink text-paper text-sm">New post</Link>
      </header>

      <table className="w-full text-sm">
        <thead className="text-left text-muted">
          <tr className="border-b border-line">
            <th className="py-2">Title</th><th>Lang</th><th>Status</th><th>Updated</th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b border-line hover:bg-surface">
              <td className="py-3">
                <Link href={`/admin/posts/${p.id}/edit`} className="font-serif text-lg">{p.title || "(untitled)"}</Link>
                <div className="text-xs text-muted">/blog/{p.slug}</div>
              </td>
              <td>{p.language}</td>
              <td><span className={cn("text-xs px-2 py-0.5 rounded-full", p.status === "published" ? "bg-accent/15 text-accent" : "bg-ink/5 text-muted")}>{p.status}</span></td>
              <td className="text-muted text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td className="text-right"><Link href={`/admin/posts/${p.id}/edit`} className="text-accent text-sm">Edit →</Link></td>
              <td className="text-right">
                <DeleteButton
                  action={async () => { "use server"; await deletePost(p.id); }}
                  itemLabel={p.title || "(untitled)"}
                />
              </td>
            </tr>
          ))}
          {posts.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted">No posts yet. Create one to get started.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
