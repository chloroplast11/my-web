import type { Metadata } from "next";
import { getPublishedPostBySlug } from "@/lib/db/posts";
import { CodeBlockEnhancer } from "@/components/blog/CodeBlockEnhancer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { renderPostHtml } from "@/lib/blocknote/render";
import { extractHeadings } from "@/lib/extract-headings";
import { readingTimeMinutes } from "@/lib/reading-time";
import { postMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return postMetadata({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    language: post.language,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTimeMinutes(JSON.stringify(post.contentJson));
  const lang = post.language;
  const html = await renderPostHtml(post.contentJson);
  const headings = extractHeadings(html);

  return (
    <main
      lang={lang}
      // Mobile: tight px/py so content fills the small viewport; lg+ goes
      // back to the wider rhythm with a sticky-friendly sidebar.
      // Container widened on desktop (max-w-7xl ≈ 80rem) so the article
      // column gets back the visual weight it lost when the grid stopped
      // allowing content to push it past 1fr.
      className="mx-auto grid max-w-7xl gap-10 px-5 pt-24 pb-20 sm:px-[5vw] lg:grid-cols-[minmax(0,1fr)_240px] lg:pt-32 lg:pb-32"
    >
      {/* min-w-0 + break-words prevent code blocks, long URLs, or unbroken
          CJK runs from pushing the grid column past the viewport. */}
      <div className="min-w-0 break-words">
        <ArticleJsonLd
          title={post.title}
          slug={post.slug}
          publishedAt={post.publishedAt}
          excerpt={post.excerpt}
        />
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted">
          <span className="text-accent">{lang}</span>
          <span>·</span>
          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
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
  );
}
