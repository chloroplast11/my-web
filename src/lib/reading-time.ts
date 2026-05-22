export function readingTimeMinutes(text: string): number {
  const cjkChars = (text.match(/[一-鿿぀-ヿ]/g) ?? []).length;
  const nonCjk = text.replace(/[一-鿿぀-ヿ]/g, " ");
  const words = nonCjk.split(/\s+/).filter(Boolean).length;
  const minutes = words / 220 + cjkChars / 500;
  return Math.max(1, Math.round(minutes));
}
