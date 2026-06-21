"use client";

import { useEffect, useState } from "react";
import type { CardId, Layout, Position } from "@/lib/bento-defaults";

type Phase = "idle" | "saving" | "error" | "saved";

export function EditToolbar({
  editMode,
  isAdmin,
  onEnter,
  onExit,
  onDiscard,
  currentLayout,
  onServerAccepted,
}: {
  editMode: boolean;
  isAdmin: boolean;
  onEnter: () => void;
  onExit: () => void;
  onDiscard: () => void;
  currentLayout: Record<CardId, Position>;
  onServerAccepted: (layout: Layout) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");

  // Auto-dismiss the "saved" toast after 2.5s.
  useEffect(() => {
    if (phase !== "saved") return;
    const id = setTimeout(() => setPhase("idle"), 2500);
    return () => clearTimeout(id);
  }, [phase]);

  async function handleSave(): Promise<void> {
    // Non-admin: local-only. State is already updated in EditableBento, so
    // just leave edit mode. A page refresh will reset to serverLayout.
    if (!isAdmin) {
      onExit();
      return;
    }
    setPhase("saving");
    try {
      const res = await fetch("/api/bento-layout", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ positions: currentLayout }),
      });
      if (res.status === 200) {
        const data = (await res.json()) as { positions: Layout };
        onServerAccepted(data.positions);
        setPhase("saved");
        onExit();
        return;
      }
      setPhase("error");
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="hidden md:block">
      {!editMode && (
        <button
          type="button"
          aria-label="enter edit mode"
          onClick={onEnter}
          className="absolute right-3 top-3 text-[14px] text-muted hover:text-accent"
        >
          ✎
        </button>
      )}
      {editMode && (
        <div className="absolute right-3 top-3 flex items-center gap-3 font-serif text-[11px] lowercase">
          <button
            type="button"
            onClick={onDiscard}
            className="text-muted hover:text-cinnabar"
          >
            discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={phase === "saving"}
            className="text-muted hover:text-accent disabled:opacity-50"
          >
            {phase === "saving" ? "saving…" : "save"}
          </button>
        </div>
      )}
      {phase === "error" && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-surface-2 px-4 py-2 text-[12px] text-cinnabar shadow-[0_4px_10px_rgba(36,30,23,0.18)]"
        >
          save failed · check your session
        </div>
      )}
      {phase === "saved" && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-surface-2 px-4 py-2 text-[12px] text-accent shadow-[0_4px_10px_rgba(36,30,23,0.18)]"
        >
          saved · live for everyone
        </div>
      )}
    </div>
  );
}
