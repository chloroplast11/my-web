// src/components/home/bento/CardFrame.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CardFrame({
  children,
  finalRotation,
  enterIndex,
  className,
  style,
}: {
  children: React.ReactNode;
  finalRotation: number;
  enterIndex: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  // Start tilt direction alternates so cards don't all rotate the same way
  const startTilt = enterIndex % 2 === 0 ? -8 : 8;

  if (reduced) {
    return (
      <div
        className={cn("absolute", className)}
        style={{ ...style, transform: `rotate(${finalRotation}deg)` }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("absolute will-change-transform", className)}
      style={{ ...style, transform: `rotate(${finalRotation}deg)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: enterIndex * 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
