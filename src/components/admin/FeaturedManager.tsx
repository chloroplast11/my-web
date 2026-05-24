"use client";
import { useState, useTransition } from "react";
import type { Featured, FeaturedKind } from "@prisma/client";
import {
  addFeaturedAction,
  removeFeaturedAction,
  reorderFeaturedAction,
  toggleFeaturedVisibilityAction,
} from "@/app/admin/_actions/featured";
import { DeleteButton } from "@/components/ui/DeleteButton";

type Option = { id: string; label: string };
type Row = Featured & { label: string };

type Props = {
  kind: FeaturedKind;
  rows: Row[];
  options: Option[];
};

export function FeaturedManager({ kind, rows: initial, options }: Props) {
  const [rows, setRows] = useState(initial);
  const [picking, setPicking] = useState("");
  const [isPending, startTransition] = useTransition();

  const move = (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    const next = idx + dir;
    if (next < 0 || next >= rows.length) return;
    const copy = [...rows];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setRows(copy);
    startTransition(() => {
      void reorderFeaturedAction(kind, copy.map((r) => r.id));
    });
  };

  const add = (refId: string) => {
    if (!refId) return;
    startTransition(() => {
      void addFeaturedAction(kind, refId);
    });
    setPicking("");
  };

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="py-3 flex items-center gap-3">
            <span className="flex flex-col text-xs text-muted">
              <button onClick={() => move(r.id, -1)} aria-label="Move up">↑</button>
              <button onClick={() => move(r.id, 1)} aria-label="Move down">↓</button>
            </span>
            <span className={`flex-1 ${r.isVisible ? "" : "text-faint line-through"}`}>{r.label}</span>
            <button
              type="button"
              onClick={() => startTransition(() => { void toggleFeaturedVisibilityAction(r.id); })}
              className="text-xs text-muted hover:text-ink"
            >
              {r.isVisible ? "Hide" : "Show"}
            </button>
            <DeleteButton
              action={() => removeFeaturedAction(r.id)}
              itemLabel={r.label}
              buttonLabel="Remove"
            />
          </li>
        ))}
        {rows.length === 0 && <li className="py-3 text-muted text-sm">None pinned yet.</li>}
      </ul>
      <div className="flex gap-2">
        <select
          value={picking}
          onChange={(e) => setPicking(e.target.value)}
          className="border border-line p-2 rounded flex-1"
        >
          <option value="">Add from library…</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => add(picking)}
          disabled={isPending || !picking}
          className="px-4 py-2 bg-ink text-paper rounded disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
