import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type BlogPreview =
  | { title: string; excerpt?: string | null; publishedAt: Date | string }
  | null;

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
      finalRotation={-2}
      enterIndex={enterIndex}
      style={{ left: 295, top: 395, width: 240, height: 85 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <Link
        href="/blog"
        className="flex min-h-[80px] h-full w-full flex-col p-3 text-[10px] text-muted xl:text-[12px] 2xl:text-[14px]"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-muted">📝 latest post</span>
          {date && (
            <span className="text-[9px] text-faint xl:text-[11px] 2xl:text-[13px]">
              {formatRelativeDay(date)}
            </span>
          )}
        </div>
        {post ? (
          <>
            <div className="mt-1 line-clamp-1 font-semibold text-ink">{post.title}</div>
            {post.excerpt && (
              <p className="mt-0.5 line-clamp-2 leading-snug text-muted">{post.excerpt}</p>
            )}
          </>
        ) : (
          <span className="mt-2 text-faint">no posts yet</span>
        )}
      </Link>
    </CardFrame>
  );
}
