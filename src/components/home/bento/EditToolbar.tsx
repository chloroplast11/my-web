"use client";

import type { CardId, Layout, Position } from "@/lib/bento-defaults";

export function EditToolbar({
  editMode,
  onEnter,
  onExit,
  onDiscard,
}: {
  editMode: boolean;
  onEnter: () => void;
  onExit: () => void;
  onDiscard: () => void;
  currentLayout: Record<CardId, Position>;
  onServerAccepted: (layout: Layout) => void;
}) {
  return (
    <div className="hidden md:block">
      {!editMode && (
        <button
          type="button"
          aria-label="enter edit mode"
          onClick={onEnter}
          className="absolute right-3 top-3 text-[14px] text-muted hover:text-accent before:content-['✎']"
        />
      )}
      {editMode && (
        <div className="absolute right-3 top-3 flex items-center gap-2 font-serif text-[11px] lowercase">
          <button type="button" onClick={onDiscard} className="text-muted hover:text-cinnabar">
            discard
          </button>
          <button type="button" onClick={onExit} className="text-muted hover:text-accent">
            save
          </button>
        </div>
      )}
    </div>
  );
}
