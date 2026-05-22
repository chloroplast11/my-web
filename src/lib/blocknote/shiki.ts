import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!highlighter) {
    highlighter = createHighlighter({
      themes: ["github-light"],
      langs: ["ts", "tsx", "js", "jsx", "json", "bash", "html", "css", "python", "go", "rust", "sql"],
    });
  }
  return highlighter;
}
