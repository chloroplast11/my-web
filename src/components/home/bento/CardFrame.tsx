"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
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
  const sizeDW = useMotionValue(0);
  const sizeDH = useMotionValue(0);

  const defaults = BENTO_DEFAULTS[cardId];
  const pos = ctx?.layout[cardId] ?? { x: defaults.x, y: defaults.y, w: defaults.w, h: defaults.h };
  const editing = !!ctx?.editMode;

  // useTransform returns a motion value derived from one or more inputs.
  // Each frame, framer-motion writes the computed CSS string to the DOM
  // without triggering a React re-render.
  const widthCalc = useTransform(
    sizeDW,
    (dw: number) => `calc(${(pos.w / BENTO_REF_W) * 100}% + ${dw}px)`,
  );
  const heightCalc = useTransform(
    sizeDH,
    (dh: number) => `calc(${(pos.h / BENTO_REF_H) * 100}% + ${dh}px)`,
  );

  // When a drag or resize commits, pos changes and CSS left/top/width/height
  // move to the new spot. We must reset the motion values to 0 in the same
  // paint frame, or the leftover transform/delta would stack on the new CSS
  // position and the card would visibly snap back to its origin.
  useLayoutEffect(() => {
    dragX.set(0);
    dragY.set(0);
    sizeDW.set(0);
    sizeDH.set(0);
  }, [pos.x, pos.y, pos.w, pos.h, dragX, dragY, sizeDW, sizeDH]);

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
    sizeDW.set((next.w - pos.w) * scale);
    sizeDH.set((next.h - pos.h) * scale);
  }

  function handleResizeCommit(corner: Corner, offset: { x: number; y: number }) {
    if (!ctx) return;
    const parent = ref.current?.parentElement;
    const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
    const next = clampAndScaleResize(pos, corner, offset, {
      renderedWidth,
      minW: defaults.minW,
      minH: defaults.minH,
    });
    ctx.setCardBox(cardId, next);
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
        editing ? "cursor-grab outline outline-1 outline-dashed outline-cinnabar/50" : "",
        className,
      )}
      style={{
        ...responsiveStyle,
        ...sharpenStyle,
        width: widthCalc,
        height: heightCalc,
        x: dragX,
        y: dragY,
      }}
      initial={{ opacity: 0 }}
      // y: 0 is the rest value for the dragY motion value used in `style`.
      // Without it framer-motion has no target to animate back to when
      // whileHover (which writes y: -3) ends, so the card stays lifted.
      animate={{ opacity: 1, rotate: finalRotation, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: enterIndex * 0.1 }}
      whileHover={editing ? undefined : hoverScale
        ? { scale: hoverScale, transition: { duration: 0.2 } }
        : { y: -3, transition: { duration: 0.2 } }}
      drag={editing}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing", filter: "drop-shadow(0 8px 16px rgba(36,30,23,0.18))" }}
    >
      {/* In edit mode, neutralize descendant pointer events so the outer
          drag handler always wins over <a>/<img> native browser drag-and-drop
          and stray Link clicks. */}
      <div
        className={cn("h-full w-full", editing ? "[&_*]:pointer-events-none" : "")}
        style={counterStyle}
      >
        {children}
      </div>
      {editing && (
        <ResizeHandles onResize={handleResize} onCommit={handleResizeCommit} />
      )}
    </motion.div>
  );
}
