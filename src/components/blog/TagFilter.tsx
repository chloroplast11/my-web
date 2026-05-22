import Link from "next/link";
import { listTags } from "@/lib/db/tags";
import { cn } from "@/lib/cn";

export async function TagFilter({ active, language }: { active?: string[]; language?: string }) {
  const tags = await listTags();
  return (
    <div className="flex gap-2 flex-wrap mt-4">
      {tags.map((t) => {
        const set = new Set(active ?? []);
        const isOn = set.has(t.slug);
        if (isOn) set.delete(t.slug); else set.add(t.slug);
        const tagParam = Array.from(set).join(",");
        const params = new URLSearchParams();
        if (language) params.set("lang", language);
        if (tagParam) params.set("tags", tagParam);
        const href = `/blog${params.toString() ? `?${params}` : ""}`;
        return (
          <Link key={t.slug} href={href} className={cn("text-xs px-3 py-1 rounded-full border", isOn ? "border-accent text-accent" : "border-line text-muted hover:border-line-2")}>
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
