"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Tag = { id: string; name: string; slug: string };

export function TagPicker({ allTags, value, onChange }: { allTags: Tag[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [filter, setFilter] = useState("");
  const visible = allTags.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()));

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div>
      <input
        placeholder="Filter tags…" value={filter} onChange={(e) => setFilter(e.target.value)}
        className="block w-full border border-line p-2 rounded text-sm mb-2"
      />
      <div className="flex flex-wrap gap-2">
        {visible.map((t) => (
          <button type="button" key={t.id} onClick={() => toggle(t.id)}
            className={cn("text-xs px-3 py-1 rounded-full border", value.includes(t.id) ? "border-accent text-accent bg-accent/10" : "border-line text-muted")}>
            {t.name}
          </button>
        ))}
        {visible.length === 0 && <p className="text-xs text-muted">No tags. Create one in /admin/tags.</p>}
      </div>
    </div>
  );
}
