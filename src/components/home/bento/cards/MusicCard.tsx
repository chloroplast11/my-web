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
      finalRotation={-2}
      enterIndex={enterIndex}
      style={{ left: 295, top: 320, width: 240, height: 60 }}
      className="rounded-full bg-accent text-surface shadow-[0_4px_10px_rgba(36,30,23,0.18)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="flex h-full w-full items-center px-5">
        <span className="truncate text-[11px] xl:text-[13px] 2xl:text-[16px]">
          ♪ {track.title} — {track.artist}
        </span>
      </div>
    </CardFrame>
  );
}
