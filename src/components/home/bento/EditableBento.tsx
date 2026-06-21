"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  BENTO_DEFAULTS,
  BENTO_REF_H,
  BENTO_REF_W,
  CLAMP_BUFFER,
  type CardId,
  type Layout,
  type Position,
} from "@/lib/bento-defaults";
import { BentoLayoutContext } from "./BentoLayoutContext";
import { EditToolbar } from "./EditToolbar";

function mergeLayout(initial: Layout): Record<CardId, Position> {
  const out: Record<CardId, Position> = {} as Record<CardId, Position>;
  for (const id of Object.keys(BENTO_DEFAULTS) as CardId[]) {
    const def = BENTO_DEFAULTS[id];
    out[id] = initial[id] ?? { x: def.x, y: def.y };
  }
  return out;
}

export function EditableBento({
  initialLayout,
  isAdmin = false,
  children,
  className,
}: {
  initialLayout: Layout;
  isAdmin?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [layout, setLayout] = useState<Record<CardId, Position>>(() => mergeLayout(initialLayout));
  const [serverLayout, setServerLayout] = useState<Record<CardId, Position>>(() =>
    mergeLayout(initialLayout),
  );
  const [editMode, setEditMode] = useState(false);

  const setCardPosition = useCallback((id: CardId, position: Position) => {
    setLayout((prev) => ({ ...prev, [id]: position }));
  }, []);

  const enterEdit = useCallback(() => setEditMode(true), []);
  const exitEdit = useCallback(() => setEditMode(false), []);

  const discard = useCallback(() => {
    setLayout(serverLayout);
    setEditMode(false);
  }, [serverLayout]);

  const acceptServerLayout = useCallback((next: Layout) => {
    const merged = mergeLayout(next);
    setLayout(merged);
    setServerLayout(merged);
  }, []);

  const value = useMemo(
    () => ({ layout, setCardPosition, editMode }),
    [layout, setCardPosition, editMode],
  );

  return (
    <BentoLayoutContext.Provider value={value}>
      <main
        className={cn(
          "relative mx-auto min-h-screen px-5 py-10",
          "max-w-[880px] xl:max-w-[1100px] 2xl:max-w-[1300px]",
          "md:flex md:items-center md:justify-center",
          className,
        )}
      >
        <div
          className={cn(
            // Mobile: single-column flex stack so the curated cards read top
            // to bottom. Desktop (md+): absolute-positioned bento canvas.
            "relative w-full flex flex-col gap-3 md:block",
            "md:h-[600px] xl:h-[750px] 2xl:h-[886px]",
          )}
        >
          {editMode && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute hidden md:block border border-dashed border-cinnabar/40"
              style={{
                left: `${(-CLAMP_BUFFER / BENTO_REF_W) * 100}%`,
                top: `${(-CLAMP_BUFFER / BENTO_REF_H) * 100}%`,
                width: `${((BENTO_REF_W + 2 * CLAMP_BUFFER) / BENTO_REF_W) * 100}%`,
                height: `${((BENTO_REF_H + 2 * CLAMP_BUFFER) / BENTO_REF_H) * 100}%`,
              }}
            />
          )}
          {children}
          <EditToolbar
            editMode={editMode}
            isAdmin={isAdmin}
            onEnter={enterEdit}
            onExit={exitEdit}
            onDiscard={discard}
            currentLayout={layout}
            onServerAccepted={acceptServerLayout}
          />
        </div>
      </main>
    </BentoLayoutContext.Provider>
  );
}
