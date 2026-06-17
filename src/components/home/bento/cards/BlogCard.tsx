import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type BlogPreview = { title: string; publishedAt: Date | string } | null;

function formatRelativeDay(date: Date): string {
  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}

export function BlogCard({ post, enterIndex }: { post: BlogPreview; enterIndex: number }) {
  const date = post ? new Date(post.publishedAt) : null;
  return (
    <CardFrame
      finalRotation={-3}
      enterIndex={enterIndex}
      style={{ left: 350, top: 286, width: 135, height: 65 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <Link href="/blog" className="flex h-full w-full flex-col justify-between p-2.5 text-[10px] text-muted">
        <span>📝 blog</span>
        {post && date ? (
          <span className="truncate text-ink">
            <span className="block truncate">{post.title}</span>
            <span className="text-[9px] text-faint">{formatRelativeDay(date)}</span>
          </span>
        ) : (
          <span className="text-faint">no posts yet</span>
        )}
      </Link>
    </CardFrame>
  );
}
