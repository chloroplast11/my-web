// src/components/home/bento/CardFrame.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { BENTO_REF_W, BENTO_REF_H } from "./BentoStage";

const EASE = [0.16, 1, 0.3, 1] as const;

// Convert numeric left/top/width/height in the incoming style into percentages
// of the bento reference box (880×380). This lets the container scale on wider
// breakpoints without applying a CSS transform — text stays crisp.
function toResponsiveStyle(style?: React.CSSProperties): React.CSSProperties | undefined {
  if (!style) return style;
  const out: React.CSSProperties = { ...style };
  if (typeof out.left === "number") out.left = `${(out.left / BENTO_REF_W) * 100}%`;
  if (typeof out.top === "number") out.top = `${(out.top / BENTO_REF_H) * 100}%`;
  if (typeof out.width === "number") out.width = `${(out.width / BENTO_REF_W) * 100}%`;
  if (typeof out.height === "number") out.height = `${(out.height / BENTO_REF_H) * 100}%`;
  return out;
}

export function CardFrame({
  children,
  finalRotation,
  enterIndex,
  className,
  style,
  hoverScale,
}: {
  children: React.ReactNode;
  finalRotation: number;
  enterIndex: number;
  className?: string;
  style?: React.CSSProperties;
  // When set, hover scales the card by this factor instead of the default lift.
  hoverScale?: number;
}) {
  const reduced = useReducedMotion();

  const responsiveStyle = toResponsiveStyle(style);

  // finalRotation is preserved as a prop for now but is expected to be 0 for
  // every card — rotation caused text blur on small Chinese characters and we
  // chose flat tiles over tilted ones. Kept so we can re-introduce a tilt
  // later without touching every card site.
  const rotated = finalRotation !== 0;
  const sharpenStyle: React.CSSProperties = rotated
    ? { backfaceVisibility: "hidden", transformStyle: "preserve-3d" }
    : {};

  // Inner wrapper counter-rotates only when the outer is actually tilted.
  const counterStyle: React.CSSProperties = rotated
    ? { transform: `rotate(${-finalRotation}deg)`, transformOrigin: "center center" }
    : {};

  if (reduced) {
    return (
      <div
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
      className={cn("md:absolute will-change-transform", className)}
      style={{ ...responsiveStyle, ...sharpenStyle }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, rotate: finalRotation }}
      transition={{ duration: 0.6, ease: EASE, delay: enterIndex * 0.1 }}
      whileHover={
        hoverScale
          ? { scale: hoverScale, transition: { duration: 0.2 } }
          : { y: -3, transition: { duration: 0.2 } }
      }
    >
      <div className="h-full w-full" style={counterStyle}>
        {children}
      </div>
    </motion.div>
  );
}
