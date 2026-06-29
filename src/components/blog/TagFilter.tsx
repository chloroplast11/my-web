"use client";

import { cn } from "@/lib/cn";
import type { Tag } from "@prisma/client";

type Props = {
  tags: Tag[];
  active: string[];
  pending?: boolean;
  onToggle: (slug: string) => void;
};

export function TagFilter({ tags, active, pending, onToggle }: Props) {
  const set = new Set(active);
  return (
    <div className="flex gap-2 flex-wrap mt-4">
      {tags.map((t) => {
        const isOn = set.has(t.slug);
        return (
          <button
            key={t.slug}
            type="button"
            onClick={() => onToggle(t.slug)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer",
              isOn ? "border-accent text-accent" : "border-line text-muted hover:border-line-2",
              pending && "cursor-wait",
            )}
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
