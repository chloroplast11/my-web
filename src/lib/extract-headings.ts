export type Heading = { id: string; text: string; level: 2 | 3 };

// Unicode-aware heading slug: keep letters/digits from any script
// (so CJK headings like "流的创建" survive), collapse everything else to "-".
// Returns an empty string if the text is purely punctuation/whitespace —
// callers must dedupe + fall back themselves.
function slugFromHeadingText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function makeSlugger() {
  const seen = new Map<string, number>();
  let sectionCounter = 0;
  return (text: string): string => {
    sectionCounter += 1;
    const base = slugFromHeadingText(text) || `section-${sectionCounter}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };
}

export function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g;
  const slug = makeSlugger();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const level = Number(m[1]) as 2 | 3;
    const attrs = m[2];
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    const idAttr = attrs.match(/\sid="([^"]*)"/);
    const id = idAttr?.[1] ? idAttr[1] : slug(text);
    out.push({ id, text, level });
  }
  return out;
}

export function addHeadingIds(html: string): string {
  const slug = makeSlugger();
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_full, lvl, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    const id = slug(text);
    // Strip any pre-existing id= attribute, then re-add ours.
    const cleanAttrs = (attrs ?? "").replace(/\sid="[^"]*"/, "");
    return `<h${lvl} id="${id}"${cleanAttrs}>${inner}</h${lvl}>`;
  });
}
