import Link from "next/link";
import type { PostListItem } from "@/lib/db/posts";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="bg-surface border border-line rounded-2xl p-7 flex flex-col gap-4 min-h-60 hover:bg-surface-2 hover:border-line-2 hover:-translate-y-1 transition"
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] tracking-wider px-3 py-1 rounded-full border border-accent/40 text-accent uppercase">
          {post.language.toUpperCase()}
        </span>
        <span className="text-xs text-faint">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
        </span>
      </div>
      <h3 className="font-serif text-[1.4rem] leading-tight tracking-tight mt-auto">{post.title}</h3>
      {post.excerpt && <p className="text-muted text-sm">{post.excerpt}</p>}
      <div className="flex gap-2 flex-wrap">
        {post.tags.map(({ tag }) => (
          <span key={tag.slug} className="text-xs text-muted px-3 py-0.5 rounded-full bg-ink/5">{tag.name}</span>
        ))}
      </div>
    </Link>
  );
}
