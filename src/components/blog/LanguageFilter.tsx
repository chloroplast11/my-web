"use client";

import { cn } from "@/lib/cn";

const langs: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "en", label: "EN" },
  { value: "zh", label: "ZH" },
  { value: "ja", label: "JA" },
];

type Props = {
  active?: string;
  pending?: boolean;
  onSelect: (lang: string | undefined) => void;
};

export function LanguageFilter({ active, pending, onSelect }: Props) {
  return (
    <div className="flex gap-4">
      {langs.map((l) => {
        const isActive = (active ?? undefined) === l.value;
        return (
          <button
            key={l.label}
            type="button"
            onClick={() => onSelect(l.value)}
            className={cn(
              "text-sm uppercase tracking-wider transition-colors cursor-pointer",
              isActive ? "text-accent" : "text-muted hover:text-ink",
              pending && "cursor-wait",
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
