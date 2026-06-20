"use client";

import { useRef } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/cn";
import { BENTO_DEFAULTS, BENTO_REF_W, BENTO_REF_H, type CardId } from "@/lib/bento-defaults";
import { useBentoLayout } from "./BentoLayoutContext";
import { clampAndScale } from "./card-frame-drag";

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

  const defaults = BENTO_DEFAULTS[cardId];
  const pos = ctx?.layout[cardId] ?? { x: defaults.x, y: defaults.y };
  const editing = !!ctx?.editMode;

  const responsiveStyle: React.CSSProperties = {
    left: `${(pos.x / BENTO_REF_W) * 100}%`,
    top: `${(pos.y / BENTO_REF_H) * 100}%`,
    width: `${(defaults.w / BENTO_REF_W) * 100}%`,
    height: `${(defaults.h / BENTO_REF_H) * 100}%`,
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
      cardW: defaults.w,
      cardH: defaults.h,
    });
    ctx.setCardPosition(cardId, next);
  }

  if (reduced) {
    return (
      <div
        ref={ref}
        className={cn("md:absolute", className)}
        style={{
          ...responsiveStyle,
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
        "md:absolute will-change-transform",
        editing ? "cursor-grab outline outline-1 outline-dashed outline-cinnabar/50" : "",
        className,
      )}
      style={{ ...responsiveStyle, ...sharpenStyle }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, rotate: finalRotation }}
      transition={{ duration: 0.6, ease: EASE, delay: enterIndex * 0.1 }}
      whileHover={editing ? undefined : hoverScale
        ? { scale: hoverScale, transition: { duration: 0.2 } }
        : { y: -3, transition: { duration: 0.2 } }}
      drag={editing}
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing", filter: "drop-shadow(0 8px 16px rgba(36,30,23,0.18))" }}
    >
      <div className="h-full w-full" style={counterStyle}>
        {children}
      </div>
    </motion.div>
  );
}
