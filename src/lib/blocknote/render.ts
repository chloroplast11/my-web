import { sanitizeHtml } from "./sanitize";
import { getHighlighter } from "./shiki";

type ServerEditor = Awaited<ReturnType<typeof loadEditor>>;
let editorPromise: Promise<ServerEditor> | null = null;

async function loadEditor() {
  const { ServerBlockNoteEditor } = await import("@blocknote/server-util");
  return ServerBlockNoteEditor.create();
}

function getEditor() {
  if (!editorPromise) editorPromise = loadEditor();
  return editorPromise;
}

export async function renderPostHtml(blocks: unknown): Promise<string> {
  const editor = await getEditor();
  const rawHtml = await editor.blocksToHTMLLossy(blocks as Parameters<typeof editor.blocksToHTMLLossy>[0]);
  const safe = sanitizeHtml(rawHtml);
  return await highlightCodeBlocks(safe);
}

// BlockNote's server-util emits code blocks as:
//   <pre data-language="ts"><code class="... language-ts" data-language="ts">...</code></pre>
// rather than the plain <pre><code class="language-ts"> form. We match either
// shape so this works with any current/future variation.
async function highlightCodeBlocks(html: string): Promise<string> {
  const highlighter = await getHighlighter();
  return html.replace(
    /<pre(?:\s[^>]*)?><code(?:\s[^>]*)?>([\s\S]*?)<\/code><\/pre>/g,
    (match, code: string) => {
      const langMatch =
        match.match(/data-language="([a-zA-Z0-9_+-]+)"/) ??
        match.match(/class="[^"]*language-([a-zA-Z0-9_+-]+)/);
      const lang = langMatch?.[1];
      const decoded = code
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
      try {
        return highlighter.codeToHtml(decoded, {
          lang: lang ?? "text",
          theme: "github-light",
        });
      } catch {
        return highlighter.codeToHtml(decoded, { lang: "text", theme: "github-light" });
      }
    },
  );
}
