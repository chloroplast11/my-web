"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useDragControls, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/cn";
import {
  BENTO_DEFAULTS,
  BENTO_REF_W,
  BENTO_REF_H,
  type CardId,
} from "@/lib/bento-defaults";
import { useBentoLayout } from "./BentoLayoutContext";
import { clampAndScale } from "./card-frame-drag";
import { clampAndScaleResize, type Corner } from "./card-frame-resize";
import { ResizeHandles } from "./card-frame-resize-handles";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CardFrame({
  cardId,
  children,
  finalRotation,
  enterIndex,
  className,
  hoverScale,
}: {
  cardId: CardId;
  children: React.ReactNode;
  finalRotation: number;
  enterIndex: number;
  className?: string;
  hoverScale?: number;
}) {
  const reduced = useReducedMotion();
  const ctx = useBentoLayout();
  const ref = useRef<HTMLDivElement | null>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  // Drag is started manually via dragControls so the parent's framer-motion
  // drag system never auto-initiates on pointerdown — handles get their own
  // gesture isolated from the parent.
  const dragControls = useDragControls();
  // onPanEnd's info.offset can be a few pixels past the last onPan sample
  // (the user kept moving in the gap between the last RAF tick and
  // pointerup). Commit from the last seen pan offset so the persisted size
  // matches the visual frame the user actually saw at release.
  const lastResizeOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const defaults = BENTO_DEFAULTS[cardId];
  const pos = ctx?.layout[cardId] ?? { x: defaults.x, y: defaults.y, w: defaults.w, h: defaults.h };
  const editing = !!ctx?.editMode;

  // When a drag or resize commits, pos changes and CSS left/top/width/height
  // move to the new spot. Reset the drag transform to (0,0) in the same paint
  // frame, otherwise the leftover translate would stack on the new CSS
  // position and the card would visibly snap back to its origin. React's
  // style prop re-applies width/height as the new % over any inline px that
  // handleResize wrote directly to the DOM.
  useLayoutEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [pos.x, pos.y, pos.w, pos.h, dragX, dragY]);

  const responsiveStyle: React.CSSProperties = {
    left: `${(pos.x / BENTO_REF_W) * 100}%`,
    top: `${(pos.y / BENTO_REF_H) * 100}%`,
  };

  const rotated = finalRotation !== 0;
  const sharpenStyle: React.CSSProperties = rotated
    ? { backfaceVisibility: "hidden", transformStyle: "preserve-3d" }
    : {};
  const counterStyle: React.CSSProperties = rotated
    ? { transform: `rotate(${-finalRotation}deg)`, transformOrigin: "center center" }
    : {};

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (!ctx) return;
    const parent = ref.current?.parentElement;
    const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
    const next = clampAndScale(pos, info.offset, {
      renderedWidth,
      cardW: pos.w,
      cardH: pos.h,
    });
    ctx.setCardBox(cardId, { ...pos, x: next.x, y: next.y });
  }

  function handleResize(corner: Corner, offset: { x: number; y: number }) {
    if (!ctx) return;
    lastResizeOffset.current = offset;
    const parent = ref.current?.parentElement;
    const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
    const next = clampAndScaleResize(pos, corner, offset, {
      renderedWidth,
      minW: defaults.minW,
      minH: defaults.minH,
    });
    // Convert ref-px deltas to rendered px so the visual matches framer-motion's
    // drag conventions (style.x/y and the calc() additions are screen px). The
    // bento aspect ratio is locked, so a single width-based scale factor applies
    // to both axes — same trick as clampAndScale in card-frame-drag.ts.
    const scale = renderedWidth / BENTO_REF_W;
    dragX.set((next.x - pos.x) * scale);
    dragY.set((next.y - pos.y) * scale);
    // Write rendered-px width/height directly to the DOM. On commit,
    // React re-renders with the new static %, which overwrites the inline
    // px; useLayoutEffect also clears it as a belt-and-suspenders.
    if (ref.current) {
      ref.current.style.width = `${next.w * scale}px`;
      ref.current.style.height = `${next.h * scale}px`;
    }
  }

  function handleResizeCommit(corner: Corner, _offset: { x: number; y: number }) {
    if (!ctx) return;
    const parent = ref.current?.parentElement;
    const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
    // Use the last onPan offset rather than onPanEnd's — see lastResizeOffset
    // comment for why.
    const offset = lastResizeOffset.current;
    const next = clampAndScaleResize(pos, corner, offset, {
      renderedWidth,
      minW: defaults.minW,
      minH: defaults.minH,
    });
    ctx.setCardBox(cardId, next);
    lastResizeOffset.current = { x: 0, y: 0 };
  }

  if (reduced) {
    return (
      <div
        ref={ref}
        className={cn("md:absolute", className)}
        style={{
          ...responsiveStyle,
          width: `${(pos.w / BENTO_REF_W) * 100}%`,
          height: `${(pos.h / BENTO_REF_H) * 100}%`,
          ...sharpenStyle,
          ...(rotated ? { transform: `rotate(${finalRotation}deg)` } : {}),
        }}
      >
        <div className="h-full w-full" style={counterStyle}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "md:absolute will-change-transform group",
        editing ? "cursor-grab select-none outline outline-1 outline-dashed outline-cinnabar/50" : "",
        className,
      )}
      style={{
        ...responsiveStyle,
        width: `${(pos.w / BENTO_REF_W) * 100}%`,
        height: `${(pos.h / BENTO_REF_H) * 100}%`,
        ...sharpenStyle,
        x: dragX,
        y: dragY,
      }}
      initial={{ opacity: 0 }}
      // y: 0 is the rest value for whileHover's y: -3 lift so framer-motion
      // knows where to animate back. In edit mode whileHover is gated off,
      // so omit y from animate — otherwise the 0.6s transition fights the
      // drag's writes to dragY mid-gesture, causing a jump on fast drags.
      animate={editing
        ? { opacity: 1, rotate: finalRotation }
        : { opacity: 1, rotate: finalRotation, y: 0 }}
      // Scope the staggered intro transition to opacity/rotate only.
      // Without per-axis overrides, framer-motion applies the 0.6s tween to
      // every animated value on the component — including dragX/dragY while
      // drag is live, which lerps the visual behind the cursor and snaps
      // back to the pointer position only on release. Setting x/y to
      // duration 0 forces direct writes (drag, useLayoutEffect resets).
      transition={{
        opacity: { duration: 0.6, ease: EASE, delay: enterIndex * 0.1 },
        rotate: { duration: 0.6, ease: EASE, delay: enterIndex * 0.1 },
        x: { duration: 0 },
        y: { duration: 0 },
      }}
      whileHover={editing ? undefined : hoverScale
        ? { scale: hoverScale, transition: { duration: 0.2 } }
        : { y: -3, transition: { duration: 0.2 } }}
      drag={editing}
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing", filter: "drop-shadow(0 8px 16px rgba(36,30,23,0.18))" }}
    >
      {/* In edit mode, neutralize descendant pointer events so the outer
          drag handler always wins over <a>/<img> native browser drag-and-drop
          and stray Link clicks. */}
      <div
        className={cn("h-full w-full", editing ? "[&_*]:pointer-events-none" : "")}
        style={counterStyle}
        // Manually starts the parent drag — only the card body initiates
        // it. ResizeHandles never call this, so handle gestures stay
        // isolated from the parent's drag system.
        onPointerDown={editing ? (e) => dragControls.start(e) : undefined}
      >
        {children}
      </div>
      {editing && (
        <ResizeHandles onResize={handleResize} onCommit={handleResizeCommit} />
      )}
    </motion.div>
  );
}
