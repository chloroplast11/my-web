"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { PostCard } from "@/components/blog/PostCard";
import { LanguageFilter } from "@/components/blog/LanguageFilter";
import { TagFilter } from "@/components/blog/TagFilter";
import type { PostListItem } from "@/lib/db/posts";
import type { Tag } from "@prisma/client";

type Props = {
  posts: PostListItem[];
  tags: Tag[];
  activeLang?: string;
  activeTags?: string[];
};

function buildHref(lang: string | undefined, tagSlugs: string[]) {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  const tagParam = tagSlugs.join(",");
  if (tagParam) params.set("tags", tagParam);
  const qs = params.toString();
  return `/blog${qs ? `?${qs}` : ""}`;
}

export function BlogContent({ posts, tags, activeLang, activeTags }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLang, setOptimisticLang] = useState<string | undefined>(activeLang);
  const [optimisticTags, setOptimisticTags] = useState<string[]>(activeTags ?? []);

  useEffect(() => {
    setOptimisticLang(activeLang);
  }, [activeLang]);

  useEffect(() => {
    setOptimisticTags(activeTags ?? []);
  }, [activeTags]);

  const navigate = (lang: string | undefined, tagSlugs: string[]) => {
    startTransition(() => {
      router.push(buildHref(lang, tagSlugs));
    });
  };

  const onLangSelect = (lang: string | undefined) => {
    setOptimisticLang(lang);
    navigate(lang, optimisticTags);
  };

  const onTagToggle = (slug: string) => {
    const next = optimisticTags.includes(slug)
      ? optimisticTags.filter((s) => s !== slug)
      : [...optimisticTags, slug];
    setOptimisticTags(next);
    navigate(optimisticLang, next);
  };

  return (
    <>
      <div className="mt-8 lg:mt-10">
        <LanguageFilter active={optimisticLang} pending={isPending} onSelect={onLangSelect} />
        <TagFilter
          tags={tags}
          active={optimisticTags}
          pending={isPending}
          onToggle={onTagToggle}
        />
      </div>
      <div
        className={cn(
          "mt-10 grid gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 transition-opacity duration-200",
          isPending && "opacity-50 pointer-events-none",
        )}
        aria-busy={isPending}
      >
        {posts.length === 0 && !isPending && (
          <p className="col-span-full text-muted">No posts yet.</p>
        )}
        {isPending && posts.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-line rounded-2xl p-7 min-h-60 animate-pulse"
              />
            ))
          : posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </>
  );
}
