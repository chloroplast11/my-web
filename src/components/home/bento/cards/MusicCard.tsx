"use client";

import { useReducedMotion } from "framer-motion";
import { CardFrame } from "../CardFrame";
import { cn } from "@/lib/cn";
import { useMusicPlayer } from "@/lib/music-player-context";

const VINYL_BG =
  "radial-gradient(circle, #1a1410 30%, #2a221c 31%, #1a1410 32%, #1a1410 40%, #2a221c 41%, #1a1410 42%, #1a1410 50%, #2a221c 51%, #1a1410 52%)";

export function MusicCard({ enterIndex }: { enterIndex: number }) {
  const reduced = useReducedMotion();
  const { track, playing, currentTime, duration, togglePlay, prev, next, seek } =
    useMusicPlayer();

  const progressPct =
    duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;
  const artistSuffix =
    track.artist && track.artist !== "—" ? ` — ${track.artist}` : "";

  return (
    <CardFrame
      cardId="music"
      finalRotation={0}
      enterIndex={enterIndex}
      className="max-md:hidden max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="relative h-full w-full">
        {/* Card body — inset from the left so the turntable overlaps it,
            with about half of the record sitting outside the body. */}
        <div className="absolute inset-y-0 left-[12%] right-0 flex items-center gap-2 rounded-lg border border-line-2 bg-paper pl-[20%] pr-3 shadow-[0_4px_10px_rgba(36,30,23,0.12)]">
          {/* Middle column — title + progress bar */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
            <span className="truncate text-[10px] font-medium leading-tight text-ink xl:text-[12px] 2xl:text-[14px]">
              ♪ {track.title}{artistSuffix}
            </span>
            <button
              type="button"
              aria-label="seek"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
              className="relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-ink/15"
            >
              <span
                className="block h-full rounded-full bg-cinnabar transition-[width] duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </button>
          </div>
          {/* Right column — prev | play (primary) | next */}
          <div className="flex shrink-0 items-center gap-1">
            <PlayerButton aria-label="previous track" onClick={prev}>⏮</PlayerButton>
            <PlayerButton
              aria-label={playing ? "pause" : "play"}
              onClick={togglePlay}
              primary
            >
              {playing ? "⏸" : "▶"}
            </PlayerButton>
            <PlayerButton aria-label="next track" onClick={next}>⏭</PlayerButton>
          </div>
        </div>
        {/* Turntable — non-spinning wrapper holds the record + tonearm.
            Sized larger than the card height so it protrudes top/bottom,
            positioned at left:0 so ~half sits outside the body. */}
        <div className="absolute left-0 top-1/2 aspect-square h-[130%] -translate-y-1/2">
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
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-paper/85"
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
      </div>
    </CardFrame>
  );
}

function PlayerButton({
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
          ? "h-7 w-7 bg-accent text-surface-2 text-[12px] hover:brightness-110 xl:h-9 xl:w-9 xl:text-[15px] 2xl:h-10 2xl:w-10 2xl:text-[17px]"
          : "h-5 w-5 text-muted text-[10px] hover:bg-ink/10 xl:h-6 xl:w-6 xl:text-[12px] 2xl:h-7 2xl:w-7 2xl:text-[14px]",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
