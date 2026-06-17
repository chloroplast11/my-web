import { CardFrame } from "../CardFrame";

export function HanabiCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={2}
      enterIndex={enterIndex}
      style={{ left: 225, top: 312, width: 115, height: 50 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <a
        href="https://hanabi.chuckchen.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center p-2.5 text-[10px] text-ink"
        aria-label="花火大会监控"
      >
        🎆 花火监控
      </a>
    </CardFrame>
  );
}
