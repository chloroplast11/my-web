"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CardFrame } from "../CardFrame";
import { cn } from "@/lib/cn";
import { PLAYLIST } from "@/lib/music-playlist";

const VINYL_BG =
  "radial-gradient(circle, #1a1410 30%, #2a221c 31%, #1a1410 32%, #1a1410 40%, #2a221c 41%, #1a1410 42%, #1a1410 50%, #2a221c 51%, #1a1410 52%)";

export function MusicCard({
  initialIndex,
  enterIndex,
}: {
  initialIndex: number;
  enterIndex: number;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), PLAYLIST.length - 1),
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = PLAYLIST[index];

  // When the track changes, reload the <audio> so the new src takes effect.
  // (Progress is reset by the handlers that change `index`, not here, so this
  // effect doesn't violate react-hooks/set-state-in-effect.)
  useEffect(() => {
    audioRef.current?.load();
  }, [index]);

  // Play/pause follows the `playing` flag. play() can reject without a
  // user gesture (e.g. autoplay block), so revert state on failure.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      // play() returns a Promise in real browsers but jsdom returns undefined;
      // Promise.resolve normalizes both.
      void Promise.resolve(audio.play()).catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, index]);

  function togglePlay() {
    setPlaying((p) => !p);
  }
  function prev() {
    setIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }
  function next() {
    setIndex((i) => (i + 1) % PLAYLIST.length);
    setPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }
  function seek(e: React.MouseEvent<HTMLButtonElement>) {
    const audio = audioRef.current;
    if (!audio || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }

  const progressPct =
    duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  const artistSuffix =
    track.artist && track.artist !== "—" ? ` — ${track.artist}` : "";

  return (
    <CardFrame
      cardId="music"
      finalRotation={0}
      enterIndex={enterIndex}
      className="max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="relative flex h-full w-full items-center gap-3 rounded-[20px] border border-line-2 bg-paper px-3 shadow-[0_4px_10px_rgba(36,30,23,0.12)]">
        <audio
          ref={audioRef}
          src={encodeURI(track.src)}
          preload="metadata"
          onEnded={next}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
        {/* Turntable — non-spinning wrapper holds the record + tonearm. The
            record alone gets the spin; the tonearm stays fixed above it. */}
        <div className="relative aspect-square h-[80%] shrink-0">
          {/* Record (spins) */}
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
            {/* off-center label highlight so the spin is visible */}
            <span className="absolute left-1/2 top-[14%] h-[5%] w-[5%] -translate-x-1/2 rounded-full bg-surface-2/70" />
          </div>
          {/* Tonearm — pivots from upper-right, cartridge rests on the inner
              groove area. Drawn in SVG so the arm + cartridge stay aligned at
              every breakpoint without rotation math. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-paper/85"
          >
            {/* arm */}
            <line
              x1="92"
              y1="10"
              x2="50"
              y2="48"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* pivot base */}
            <circle cx="92" cy="10" r="6" fill="currentColor" />
            <circle cx="92" cy="10" r="2.5" fill="#1a1410" />
            {/* cartridge head at the tip */}
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
        {/* Middle column — title row + progress bar row, stacked. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <span className="truncate text-[10px] font-medium leading-tight text-ink xl:text-[12px] 2xl:text-[14px]">
            ♪ {track.title}{artistSuffix}
          </span>
          <button
            type="button"
            aria-label="seek"
            onClick={seek}
            className="relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-ink/15"
          >
            <span
              className="block h-full rounded-full bg-cinnabar transition-[width] duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </button>
        </div>
        {/* Right column — prev | play (primary) | next. */}
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
    </CardFrame>
  );
}

function PlayerButton({
  children,
  onClick,
  primary,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  // Two sizes: secondary (prev/next) and primary (play/pause). Primary is
  // ~30% larger and gets the ink-on-paper inversion so it reads as the main
  // action. Sizes scale with breakpoint so they stay proportional to the pill.
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
