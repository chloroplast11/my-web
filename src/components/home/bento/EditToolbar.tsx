"use client";

import { useEffect, useRef, useState } from "react";
import type { CardId, Layout, Position } from "@/lib/bento-defaults";

type Phase = "idle" | "key" | "saving" | "error" | "saved";

export function EditToolbar({
  editMode,
  onEnter,
  onExit,
  onDiscard,
  currentLayout,
  onServerAccepted,
}: {
  editMode: boolean;
  onEnter: () => void;
  onExit: () => void;
  onDiscard: () => void;
  currentLayout: Record<CardId, Position>;
  onServerAccepted: (layout: Layout) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [keyInput, setKeyInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-dismiss the "saved" toast after 2.5s
  useEffect(() => {
    if (phase !== "saved") return;
    const id = setTimeout(() => setPhase("idle"), 2500);
    return () => clearTimeout(id);
  }, [phase]);

  // Close the key input when exiting edit mode externally
  useEffect(() => {
    if (!editMode) {
      const id = setTimeout(() => setPhase("idle"), 0);
      return () => clearTimeout(id);
    }
  }, [editMode]);

  async function submitKey(): Promise<void> {
    if (!keyInput) return;
    setPhase("saving");
    try {
      const res = await fetch("/api/bento-layout", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ positions: currentLayout, key: keyInput }),
      });
      if (res.status === 200) {
        const data = (await res.json()) as { positions: Layout };
        onServerAccepted(data.positions);
        setKeyInput("");
        setPhase("saved");
        onExit();
        return;
      }
      if (res.status === 401) {
        setPhase("error");
        setKeyInput("");
        requestAnimationFrame(() => inputRef.current?.focus());
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
            <button type="button" onClick={onDiscard} className="text-muted hover:text-cinnabar">
              discard
            </button>
            <button type="button" onClick={onExit} className="text-muted hover:text-accent">
              save
            </button>
            <button
              type="button"
              onClick={() => setPhase("key")}
              className="text-muted hover:text-cinnabar"
            >
              save with key
            </button>
          </div>
        )}
        {editMode && (phase === "key" || phase === "saving" || phase === "error") && (
          <div className="absolute right-3 top-10 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="bento-key-input">layout key</label>
              <input
                id="bento-key-input"
                ref={inputRef}
                type="password"
                autoFocus
                disabled={phase === "saving"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitKey();
                  } else if (e.key === "Escape") {
                    setPhase("idle");
                    setKeyInput("");
                  }
                }}
                className={`h-7 w-44 rounded-sm border bg-paper px-2 font-mono text-[12px] text-ink ${
                  phase === "error" ? "border-cinnabar" : "border-line-2"
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setPhase("idle");
                  setKeyInput("");
                }}
                className="font-serif text-[10px] text-muted hover:text-cinnabar"
              >
                cancel
              </button>
            </div>
            {phase === "error" && (
              <span className="text-[10px] text-cinnabar">wrong key</span>
            )}
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
