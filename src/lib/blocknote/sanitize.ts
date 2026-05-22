import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
  return clean.replace(/<a([^>]*)target="_blank"([^>]*)>/g, (m, a, b) =>
    /rel=/.test(m) ? m : `<a${a}target="_blank" rel="noopener noreferrer"${b}>`,
  );
}
