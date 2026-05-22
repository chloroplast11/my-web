import { getPublishedPostBySlug } from "@/lib/db/posts";
import { PostRenderer } from "@/components/blog/PostRenderer";
import { CodeBlockEnhancer } from "@/components/blog/CodeBlockEnhancer";
import { readingTimeMinutes } from "@/lib/reading-time";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTimeMinutes(JSON.stringify(post.contentJson));
  const lang = post.language;

  return (
    <main lang={lang} className="px-[5vw] pt-32 pb-32 max-w-3xl mx-auto">
      <div className="text-xs tracking-wider uppercase text-muted flex gap-3">
        <span className="text-accent">{lang}</span>
        <span>·</span>
        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
        <span>·</span>
        <span>{minutes} min read</span>
      </div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,4rem)] mt-6 leading-tight tracking-tight">{post.title}</h1>
      {post.excerpt && <p className="text-muted text-lg mt-4">{post.excerpt}</p>}
      <hr className="my-12 border-line" />
      <PostRenderer contentJson={post.contentJson} />
      <CodeBlockEnhancer />
    </main>
  );
}
