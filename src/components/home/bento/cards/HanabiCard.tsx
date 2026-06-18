import { CardFrame } from "../CardFrame";

export function HanabiCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={3}
      enterIndex={enterIndex}
      style={{ left: 555, top: 430, width: 200, height: 50 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <a
        href="https://hanabi.chuckchen.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center justify-between p-3 text-ink"
        aria-label="花火大会监控"
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold xl:text-[13px] 2xl:text-[15px]">
            🎆 花火监控
          </span>
          <span className="text-[8px] text-muted xl:text-[10px] 2xl:text-[12px]">
            Tokyo summer · ticket alerts
          </span>
        </span>
        <span className="text-[10px] text-accent xl:text-[12px] 2xl:text-[14px]">↗</span>
      </a>
    </CardFrame>
  );
}
