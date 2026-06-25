import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminPostBySlug } from "@/lib/db/posts";
import { CodeBlockEnhancer } from "@/components/blog/CodeBlockEnhancer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { renderPostHtml } from "@/lib/blocknote/render";
import { extractHeadings } from "@/lib/extract-headings";
import { readingTimeMinutes } from "@/lib/reading-time";

export default async function PreviewPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) notFound();

  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTimeMinutes(JSON.stringify(post.contentJson));
  const html = await renderPostHtml(post.contentJson);
  const headings = extractHeadings(html);
  const isDraft = post.status === "draft";

  return (
    <>
      <div
        data-status={isDraft ? "draft" : "published"}
        className={
          "sticky top-20 z-40 mt-20 flex items-center justify-between px-5 py-2 text-xs uppercase tracking-wider border-b " +
          (isDraft
            ? "border-cinnabar/40 bg-cinnabar/10 text-cinnabar"
            : "border-accent/40 bg-accent/10 text-accent")
        }
      >
        <span>{isDraft ? "Draft preview" : "Preview · Live"}</span>
        <Link
          href={`/admin/posts/${post.id}/edit`}
          className="text-ink hover:text-accent normal-case tracking-normal"
        >
          Edit ↗
        </Link>
      </div>
      <main
        lang={post.language}
        className="mx-auto grid max-w-7xl gap-10 px-5 pt-8 pb-20 sm:px-[5vw] lg:grid-cols-[minmax(0,1fr)_240px] lg:pt-12 lg:pb-32"
      >
        <div className="min-w-0 break-words">
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="text-accent">{post.language}</span>
            <span>·</span>
            <span>
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "unpublished"}
            </span>
            <span>·</span>
            <span>{minutes} min read</span>
          </div>
          <h1 className="mt-5 font-serif text-[clamp(1.8rem,6vw,4rem)] leading-tight tracking-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base text-muted sm:text-lg">{post.excerpt}</p>
          )}
          <hr className="my-8 border-line lg:my-12" />
          <article
            className="prose prose-sm prose-stone max-w-none prose-headings:font-serif prose-img:rounded-lg prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-line prose-pre:bg-surface sm:prose-base"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <CodeBlockEnhancer />
        </div>
        <TableOfContents headings={headings} />
      </main>
    </>
  );
}
