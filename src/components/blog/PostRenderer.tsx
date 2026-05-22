import { renderPostHtml } from "@/lib/blocknote/render";

export async function PostRenderer({ contentJson }: { contentJson: unknown }) {
  const html = await renderPostHtml(contentJson);
  return (
    <article
      className="prose prose-stone max-w-none prose-headings:font-serif prose-pre:bg-surface prose-pre:border prose-pre:border-line prose-pre:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
