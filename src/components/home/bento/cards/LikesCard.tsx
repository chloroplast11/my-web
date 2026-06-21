"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CardFrame } from "../CardFrame";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "site-loved";

export function LikesCard({
  enterIndex,
  initialCount,
}: {
  enterIndex: number;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pulseId, setPulseId] = useState(0);

  // Read the localStorage flag after mount so we don't desync SSR / CSR.
  // Deferred via setTimeout(0) to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY) === "true") setLiked(true);
      } catch {
        // localStorage may be unavailable (private mode etc.); ignore.
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);
    setPulseId((id) => id + 1);
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    void fetch("/api/likes", { method: "POST" })
      .then((r) => (r.ok ? (r.json() as Promise<{ count: number }>) : null))
      .then((data) => {
        if (data && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        // optimistic — keep the local +1 even if the server hiccups
      });
  }

  return (
    <CardFrame
      cardId="likes"
      finalRotation={0}
      enterIndex={enterIndex}
      className="max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-auto max-md:!h-auto max-md:self-center max-md:order-5"
    >
      <button
        type="button"
        onClick={handleLike}
        aria-label={
          liked
            ? `you loved this corner — ${count} loves total`
            : `tap to love this corner — ${count} loves total`
        }
        className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:px-8 max-md:py-3"
      >
        <motion.span
          aria-hidden="true"
          key={pulseId}
          animate={
            pulseId === 0
              ? { scale: 1 }
              : { scale: [1, 1.45, 1] }
          }
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={cn(
            "block leading-none text-cinnabar transition-transform",
            !liked && "group-hover:scale-110",
          )}
        >
          <Heart filled={liked} />
        </motion.span>
        <span className="font-serif text-[18px] font-bold italic leading-none text-ink xl:text-[22px] 2xl:text-[26px]">
          {count}
        </span>
        <span className="text-[8px] uppercase tracking-[0.2em] leading-none text-muted xl:text-[9px]">
          loves
        </span>
        {/* Floating "+1" feedback on click */}
        {pulseId > 0 && (
          <motion.span
            key={`plus-${pulseId}`}
            aria-hidden="true"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="pointer-events-none absolute right-2 top-2 font-serif text-[12px] font-bold italic text-cinnabar"
          >
            +1
          </motion.span>
        )}
      </button>
    </CardFrame>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8">
      <path
        d="M12 21s-7-4.534-7-10a4 4 0 0 1 7-2.646A4 4 0 0 1 19 11c0 5.466-7 10-7 10z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
