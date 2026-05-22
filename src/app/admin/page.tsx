import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";

export default async function AdminHome() {
  const session = await auth();
  const [postCount, draftCount, photoCount, tagCount] = await Promise.all([
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.photo.count(),
    prisma.tag.count(),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-baseline">
        <h1 className="font-serif text-3xl">Admin</h1>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button className="text-sm text-muted hover:text-ink">Sign out · {session?.user?.email}</button>
        </form>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Published" value={postCount} />
        <Stat label="Drafts" value={draftCount} />
        <Stat label="Photos" value={photoCount} />
        <Stat label="Tags" value={tagCount} />
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <AdminLink href="/admin/posts" title="Posts" desc="Write, edit, publish" />
        <AdminLink href="/admin/tags" title="Tags" desc="Manage categories" />
        <AdminLink href="/admin/photos" title="Photos" desc="Upload, reorder" />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line p-5 rounded-xl">
      <div className="font-serif text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted mt-1">{label}</div>
    </div>
  );
}

function AdminLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block border border-line p-6 rounded-xl hover:border-line-2 hover:bg-surface transition">
      <div className="font-serif text-xl">{title}</div>
      <div className="text-sm text-muted mt-1">{desc}</div>
    </Link>
  );
}
