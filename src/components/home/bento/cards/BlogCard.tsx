import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type BlogPreview =
  | { title: string; excerpt?: string | null; publishedAt: Date | string }
  | null;

function formatNewsDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

const TORN =
  "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 50% 96%, 6% 100%, 0 95%)";

export function BlogCard({ post, enterIndex }: { post: BlogPreview; enterIndex: number }) {
  const date = post ? new Date(post.publishedAt) : null;
  return (
    <CardFrame
      cardId="blog"
      finalRotation={0}
      enterIndex={enterIndex}
      className="border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <Link
        href="/blog"
        aria-label="latest blog post"
        className="flex h-full w-full flex-col px-5 pb-5 pt-4 font-serif text-ink xl:px-6 2xl:px-7"
        style={{ clipPath: TORN }}
      >
        <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-1 mt-2">
          <span className="text-[13px] font-bold italic xl:text-[15px] 2xl:text-[17px]">
            The Quiet Times
          </span>
          <span className="font-mono text-[9px] text-muted xl:text-[11px] 2xl:text-[13px]">
            {date ? formatNewsDate(date) : "—"}
          </span>
        </div>
        <div className="mt-[2px] text-[8px] uppercase tracking-[0.14em] text-muted xl:text-[10px] 2xl:text-[11px]">
          Vol. III · Friday Edition
        </div>
        {post ? (
          <>
            <div className="mt-3 line-clamp-2 text-[14px] font-bold leading-[1.15] xl:text-[16px] 2xl:text-[18px]">
              {post.title}
            </div>
            <div className="mt-1 text-[8px] uppercase tracking-[0.14em] text-cinnabar xl:text-[10px] 2xl:text-[11px]">
              — from the journal
            </div>
            {post.excerpt && (
              <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-muted xl:text-[12px] 2xl:text-[14px]">
                {post.excerpt}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mt-1 text-[8px] uppercase tracking-[0.14em] text-cinnabar xl:text-[10px] 2xl:text-[11px]">
              — from the journal
            </div>
            <span className="mt-3 text-[11px] text-faint">no posts yet</span>
          </>
        )}
      </Link>
    </CardFrame>
  );
}
