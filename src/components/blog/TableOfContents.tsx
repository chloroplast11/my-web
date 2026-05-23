import type { Heading } from "@/lib/extract-headings";
import { cn } from "@/lib/cn";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;
  return (
    <aside className="hidden lg:block sticky top-32 text-sm space-y-2">
      <div className="text-xs uppercase tracking-wider text-muted mb-3">On this page</div>
      <ul className="space-y-2 border-l border-line pl-4">
        {headings.map((h) => (
          <li key={h.id} className={cn("leading-snug", h.level === 3 && "ml-3 text-muted")}>
            <a href={`#${h.id}`} className="hover:text-accent">{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
