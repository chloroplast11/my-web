"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CardFrame } from "../CardFrame";
import type { Track } from "@/lib/music-playlist";

const VINYL_BG =
  "radial-gradient(circle, #1a1410 30%, #2a221c 31%, #1a1410 32%, #1a1410 40%, #2a221c 41%, #1a1410 42%, #1a1410 50%, #2a221c 51%, #1a1410 52%)";

export function MusicCard({ track, enterIndex }: { track: Track; enterIndex: number }) {
  const reduced = useReducedMotion();

  return (
    <CardFrame
      finalRotation={-2}
      enterIndex={enterIndex}
      style={{ left: 340, top: 440, width: 260, height: 76 }}
      className="max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="relative h-full w-full">
        <div className="absolute left-[36px] right-0 top-[8px] bottom-[8px] flex items-center rounded-full bg-accent pl-[44px] pr-5 text-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.18)]">
          <span className="truncate text-[11px] xl:text-[13px] 2xl:text-[16px]">
            ♪ {track.title} — {track.artist}
          </span>
        </div>
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-0 flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          style={{ backgroundImage: VINYL_BG, backgroundColor: "#1a1410" }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <span className="h-[22px] w-[22px] rounded-full bg-cinnabar" />
        </motion.div>
      </div>
    </CardFrame>
  );
}
