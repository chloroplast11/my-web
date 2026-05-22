import { listPublishedPosts } from "@/lib/db/posts";
import { PostCard } from "@/components/blog/PostCard";
import { LanguageFilter } from "@/components/blog/LanguageFilter";
import { TagFilter } from "@/components/blog/TagFilter";
import type { Language } from "@prisma/client";

type SP = { lang?: string; tags?: string };

function parseLang(v: string | undefined): Language | undefined {
  return v === "en" || v === "zh" || v === "ja" ? v : undefined;
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const language = parseLang(sp.lang);
  const tagSlugs = sp.tags ? sp.tags.split(",").filter(Boolean) : undefined;
  const posts = await listPublishedPosts({ language, tagSlugs });

  return (
    <main className="px-[5vw] pt-32 pb-32 max-w-[var(--container-site)] mx-auto">
      <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)]">Writing</h1>
      <p className="text-muted mt-3">Notes on engineering, design, and the light I keep chasing.</p>
      <div className="mt-10">
        <LanguageFilter active={language} />
        <TagFilter active={tagSlugs} language={language} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-16">
        {posts.length === 0 && <p className="text-muted col-span-full">No posts yet.</p>}
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </main>
  );
}
