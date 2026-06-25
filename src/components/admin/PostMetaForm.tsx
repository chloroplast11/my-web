"use client";
import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/slugify";
import { TagPicker } from "./TagPicker";

const PostEditor = dynamic(() => import("./PostEditor").then((m) => m.PostEditor), {
  ssr: false,
  loading: () => <div className="text-muted text-sm p-4">Loading editor…</div>,
});

type Tag = { id: string; name: string; slug: string };
type Lang = "en" | "zh" | "ja";

export type PostFormValue = {
  title: string;
  slug: string;
  language: Lang;
  excerpt: string;
  coverImageUrl: string;
  contentJson: unknown;
  tagIds: string[];
};

export function PostMetaForm({
  initial, allTags, onSubmit, submitLabel, navOffset = false,
}: {
  initial: PostFormValue;
  allTags: Tag[];
  onSubmit: (v: PostFormValue) => Promise<void> | void;
  submitLabel: string;
  navOffset?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof PostFormValue>(k: K, v: PostFormValue[K]) {
    setValue((s) => ({ ...s, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); startTransition(() => { void onSubmit(value); }); }}
      className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-start"
    >
      {/* LEFT PANE: title, slug, editor */}
      <div data-pane="left" className="min-w-0 space-y-4">
        <div className={"sticky " + (navOffset ? "top-20" : "top-0") + " z-10 -mx-1 bg-paper px-1 pb-3 border-b border-line"}>
          <input
            name="title"
            value={value.title}
            onChange={(e) => {
              const t = e.target.value;
              setValue((s) => ({ ...s, title: t, slug: s.slug || slugify(t) }));
            }}
            placeholder="Untitled"
            aria-label="Title"
            className="block w-full bg-transparent border-none p-0 font-serif text-3xl xl:text-4xl text-ink outline-none placeholder:text-line-2"
            required
          />
          <div className="mt-2 flex items-baseline gap-1 font-mono text-xs text-muted">
            <span>/blog/</span>
            <input
              name="slug"
              value={value.slug}
              onChange={(e) => update("slug", slugify(e.target.value))}
              aria-label="Slug"
              className="flex-1 bg-transparent border-none border-b border-dashed border-line-2 p-1 text-ink outline-none"
              required
            />
          </div>
        </div>
        <div className="border border-line rounded p-2 min-h-[460px]">
          <PostEditor initialContent={value.contentJson} onChange={(c) => update("contentJson", c)} />
        </div>
      </div>

      {/* RIGHT PANE: excerpt, tags, cover, language, save */}
      <div
        data-pane="right"
        className={"md:sticky " + (navOffset ? "md:top-24" : "md:top-6") + " flex flex-col gap-5 rounded-md border border-line bg-surface p-5"}
      >
        <div>
          <label htmlFor="pmf-excerpt" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Excerpt</label>
          <textarea
            id="pmf-excerpt"
            name="excerpt"
            value={value.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={3}
            className="block w-full border border-line p-2 rounded bg-paper text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">Tags</label>
          <TagPicker allTags={allTags} value={value.tagIds} onChange={(ids) => update("tagIds", ids)} />
        </div>
        <div>
          <label htmlFor="pmf-cover" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Cover image URL</label>
          <input
            id="pmf-cover"
            name="coverImageUrl"
            value={value.coverImageUrl}
            onChange={(e) => update("coverImageUrl", e.target.value)}
            className="block w-full border border-line p-2 rounded bg-paper font-mono text-xs"
            placeholder="https://res.cloudinary.com/…"
          />
        </div>
        <div>
          <label htmlFor="pmf-lang" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Language</label>
          <select
            id="pmf-lang"
            name="language"
            value={value.language}
            onChange={(e) => update("language", e.target.value as Lang)}
            className="block w-full border border-line p-2 rounded bg-paper"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full mt-2 px-6 py-3 rounded-full bg-ink text-paper hover:bg-accent transition-colors disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
