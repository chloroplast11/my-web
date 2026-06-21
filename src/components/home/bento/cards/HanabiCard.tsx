import { CardFrame } from "../CardFrame";

export function HanabiCard({ enterIndex }: { enterIndex: number }) {
  const year = new Date().getFullYear();
  return (
    <CardFrame
      cardId="hanabi"
      finalRotation={0}
      enterIndex={enterIndex}
      className="overflow-hidden rounded-[4px] bg-cinnabar text-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.16)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <a
        href="https://hanabi.chuckchen.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-full w-full items-stretch"
        aria-label="花火大会监控"
      >
        <div className="flex flex-1 flex-col justify-center px-6 font-serif">
          <span className="text-[13px] font-bold leading-tight xl:text-[15px] 2xl:text-[17px]">
            🎆 花火监控
          </span>
          <span className="text-[9px] tracking-[0.08em] opacity-90 xl:text-[11px] 2xl:text-[13px]">
            Tokyo · ticket alerts
          </span>
        </div>
        <div
          aria-hidden="true"
          className="w-0 self-stretch border-l border-dashed border-surface-2/70"
        />
        <div className="flex w-[36%] flex-col items-center justify-center font-mono tracking-[0.14em]">
          <span className="text-[16px] font-bold xl:text-[18px] 2xl:text-[20px]">
            {year}
          </span>
          <span className="text-[9px] xl:text-[11px] 2xl:text-[13px]">ADMIT ONE</span>
        </div>
      </a>
    </CardFrame>
  );
}
