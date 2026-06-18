import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function AboutCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-1}
      enterIndex={enterIndex}
      style={{ left: 30, top: 130, width: 240, height: 230 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto max-md:col-span-2"
    >
      <Link
        href="/about"
        className="flex h-full w-full flex-col p-5 text-ink"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-paper-2 ring-1 ring-line-2" aria-hidden="true" />
          <div className="leading-tight">
            <div className="font-serif text-[15px] font-bold xl:text-[17px] 2xl:text-[20px]">
              Chuck Chen
            </div>
            <div className="text-[9px] text-muted xl:text-[11px] 2xl:text-[13px]">
              software engineer · Shanghai
            </div>
          </div>
        </div>
        <p className="text-[10px] leading-relaxed text-muted xl:text-[12px] 2xl:text-[14px]">
          Building quiet things on the side, chasing good light, and trying
          to keep this corner of the internet small.
        </p>
        <span className="mt-auto text-[10px] font-normal text-accent xl:text-[12px] 2xl:text-[14px]">
          about me →
        </span>
      </Link>
    </CardFrame>
  );
}
