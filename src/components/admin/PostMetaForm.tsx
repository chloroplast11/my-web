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
  initial, allTags, onSubmit, submitLabel,
}: {
  initial: PostFormValue;
  allTags: Tag[];
  onSubmit: (v: PostFormValue) => Promise<void> | void;
  submitLabel: string;
}) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof PostFormValue>(k: K, v: PostFormValue[K]) {
    setValue((s) => ({ ...s, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); startTransition(() => { void onSubmit(value); }); }}
      className="space-y-6"
    >
      <div>
        <label className="text-xs uppercase tracking-wider text-muted">Title</label>
        <input
          value={value.title}
          onChange={(e) => {
            const t = e.target.value;
            setValue((s) => ({ ...s, title: t, slug: s.slug || slugify(t) }));
          }}
          className="block w-full border border-line p-3 rounded font-serif text-xl"
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted">Slug</label>
          <input value={value.slug} onChange={(e) => update("slug", slugify(e.target.value))}
            className="block w-full border border-line p-3 rounded font-mono text-sm" required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted">Language</label>
          <select value={value.language} onChange={(e) => update("language", e.target.value as Lang)}
            className="block w-full border border-line p-3 rounded">
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted">Excerpt</label>
        <textarea value={value.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={2}
          className="block w-full border border-line p-3 rounded" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted">Cover image URL</label>
        <input value={value.coverImageUrl} onChange={(e) => update("coverImageUrl", e.target.value)}
          className="block w-full border border-line p-3 rounded font-mono text-xs" placeholder="https://res.cloudinary.com/…" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted">Tags</label>
        <TagPicker allTags={allTags} value={value.tagIds} onChange={(ids) => update("tagIds", ids)} />
      </div>
      <div className="border border-line rounded p-2 min-h-[400px]">
        <PostEditor initialContent={value.contentJson} onChange={(c) => update("contentJson", c)} />
      </div>
      <button disabled={pending} className="px-6 py-3 rounded-full bg-ink text-paper">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
