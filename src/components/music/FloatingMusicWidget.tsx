"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useMusicPlayer } from "@/lib/music-player-context";

const VINYL_BG =
  "radial-gradient(circle, #1a1410 30%, #2a221c 31%, #1a1410 32%, #1a1410 40%, #2a221c 41%, #1a1410 42%, #1a1410 50%, #2a221c 51%, #1a1410 52%)";

export function FloatingMusicWidget() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const player = useMusicPlayer();

  // Hide on the homepage (the bento card owns the player UI there) and before
  // the user has interacted with the player at all.
  if (pathname === "/") return null;
  if (!player.hasStarted) return null;

  const { track, playing, currentTime, duration, togglePlay, prev, next, seek } =
    player;
  const progressPct =
    duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;
  const artistSuffix =
    track.artist && track.artist !== "—" ? ` — ${track.artist}` : "";

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50 flex w-[280px] items-center gap-2 rounded-lg border border-line-2 bg-paper py-2 pl-12 pr-3 shadow-[0_8px_20px_rgba(36,30,23,0.18)]"
      whileDrag={{ cursor: "grabbing" }}
    >
      {/* Vinyl — small, sits on the left, half overlapping the body */}
      <div className="pointer-events-none absolute left-1.5 top-1/2 aspect-square h-[120%] -translate-y-1/2">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)]",
            !reduced && "[animation:spin_6s_linear_infinite]",
            (!playing || reduced) && "[animation-play-state:paused]",
          )}
          style={{ backgroundImage: VINYL_BG, backgroundColor: "#1a1410" }}
        >
          <span className="h-[28%] w-[28%] rounded-full bg-cinnabar" />
          <span className="absolute left-1/2 top-[14%] h-[5%] w-[5%] -translate-x-1/2 rounded-full bg-surface-2/70" />
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible text-paper/85"
        >
          <line
            x1="92"
            y1="10"
            x2="50"
            y2="48"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="92" cy="10" r="6" fill="currentColor" />
          <circle cx="92" cy="10" r="2.5" fill="#1a1410" />
          <rect
            x="43"
            y="44"
            width="11"
            height="9"
            rx="1.5"
            fill="currentColor"
            transform="rotate(42 48.5 48.5)"
          />
        </svg>
      </div>

      {/* Middle — title + bar */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="truncate text-[11px] font-medium leading-tight text-ink">
          ♪ {track.title}
          {artistSuffix}
        </span>
        <button
          type="button"
          aria-label="seek"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
          className="relative h-1 cursor-pointer overflow-hidden rounded-full bg-ink/15"
        >
          <span
            className="block h-full rounded-full bg-cinnabar transition-[width] duration-100"
            style={{ width: `${progressPct}%` }}
          />
        </button>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center gap-1">
        <MiniButton aria-label="previous track" onClick={prev}>⏮</MiniButton>
        <MiniButton
          aria-label={playing ? "pause" : "play"}
          onClick={togglePlay}
          primary
        >
          {playing ? "⏸" : "▶"}
        </MiniButton>
        <MiniButton aria-label="next track" onClick={next}>⏭</MiniButton>
      </div>
    </motion.div>
  );
}

function MiniButton({
  children,
  onClick,
  primary,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-full leading-none transition-colors",
        primary
          ? "h-7 w-7 bg-accent text-surface-2 text-[12px] hover:brightness-110"
          : "h-5 w-5 text-muted text-[10px] hover:bg-ink/10",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
