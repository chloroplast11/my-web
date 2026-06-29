import { listPublishedPosts } from "@/lib/db/posts";
import { listTags } from "@/lib/db/tags";
import { BlogContent } from "@/components/blog/BlogContent";
import type { Language } from "@prisma/client";

type SP = { lang?: string; tags?: string };

function parseLang(v: string | undefined): Language | undefined {
  return v === "en" || v === "zh" || v === "ja" ? v : undefined;
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const language = parseLang(sp.lang);
  const tagSlugs = sp.tags ? sp.tags.split(",").filter(Boolean) : undefined;
  const [posts, tags] = await Promise.all([
    listPublishedPosts({ language, tagSlugs }),
    listTags(),
  ]);

  return (
    <main className="mx-auto max-w-[var(--container-site)] px-5 pt-24 pb-20 sm:px-[5vw] lg:pt-32 lg:pb-32">
      <h1 className="font-serif text-[clamp(1.8rem,6vw,3.5rem)] leading-tight">Writing</h1>
      <p className="mt-3 text-muted">
        Notes on engineering, design, and the light I keep chasing.
      </p>
      <BlogContent
        posts={posts}
        tags={tags}
        activeLang={language}
        activeTags={tagSlugs}
      />
    </main>
  );
}
