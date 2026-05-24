import { renderPostHtml } from "@/lib/blocknote/render";
import { BlogImageLightbox } from "./BlogImageLightbox";

export async function PostRenderer({ contentJson }: { contentJson: unknown }) {
  const html = await renderPostHtml(contentJson);
  return <BlogImageLightbox html={html} />;
}
