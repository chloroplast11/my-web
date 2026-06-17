import { CardFrame } from "../CardFrame";
import type { Track } from "@/lib/music-playlist";

export function MusicCard({
  track,
  enterIndex,
}: {
  track: Track;
  enterIndex: number;
}) {
  return (
    <CardFrame
      finalRotation={-3}
      enterIndex={enterIndex}
      style={{ left: 350, top: 208, width: 200, height: 58 }}
      className="flex items-center rounded-full bg-accent px-4 text-surface shadow-[0_4px_10px_rgba(36,30,23,0.18)]"
    >
      <span className="truncate text-[11px]">
        ♪ {track.title} — {track.artist}
      </span>
    </CardFrame>
  );
}
