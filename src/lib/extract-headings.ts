export type Heading = { id: string; text: string; level: 2 | 3 };

export function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const level = Number(m[1]) as 2 | 3;
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    out.push({ id, text, level });
  }
  return out;
}

export function addHeadingIds(html: string): string {
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_full, lvl, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `<h${lvl} id="${id}"${attrs ?? ""}>${inner}</h${lvl}>`;
  });
}
