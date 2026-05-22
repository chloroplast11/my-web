import Link from "next/link";
import { cn } from "@/lib/cn";

const langs = [
  { value: undefined as string | undefined, label: "All" },
  { value: "en", label: "EN" },
  { value: "zh", label: "ZH" },
  { value: "ja", label: "JA" },
];

export function LanguageFilter({ active }: { active?: string }) {
  return (
    <div className="flex gap-4">
      {langs.map((l) => {
        const href = l.value ? `/blog?lang=${l.value}` : "/blog";
        const isActive = (active ?? undefined) === l.value;
        return (
          <Link key={l.label} href={href} className={cn("text-sm uppercase tracking-wider", isActive ? "text-accent" : "text-muted hover:text-ink")}>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
