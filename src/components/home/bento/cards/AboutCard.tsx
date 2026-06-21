import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function AboutCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      cardId="about"
      finalRotation={0}
      enterIndex={enterIndex}
      className="relative overflow-hidden rounded-md border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto max-md:col-span-2"
    >
      <Link
        href="/about"
        aria-label="about me"
        className="relative flex h-full w-full flex-col py-4 pl-5 pr-4 text-ink"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 22px, rgba(36,30,23,0.13) 22px 23px)",
          borderLeft: "3px solid var(--color-cinnabar)",
        }}
      >
        <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted xl:text-[10px] 2xl:text-[12px]">
          Author Card
        </div>
        <div className="mt-1 font-serif text-[18px] font-bold italic leading-tight xl:text-[20px] 2xl:text-[24px]">
          Chuck Chen
        </div>
        <div className="text-[10px] text-muted xl:text-[12px] 2xl:text-[14px]">
          software engineer · Shanghai
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted xl:text-[12px] 2xl:text-[14px]">
          Building quiet things on the side, chasing good light, and trying to
          keep this corner of the internet small.
        </p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full border-2 border-cinnabar font-serif text-cinnabar opacity-70"
          style={{ transform: "rotate(-12deg)" }}
        >
          <span className="text-[9px] tracking-[0.14em]">EST.</span>
          <span className="text-[14px] font-bold leading-none">1995</span>
        </div>
        <span className="mt-auto text-[10px] font-normal text-accent xl:text-[12px] 2xl:text-[14px]">
          about me →
        </span>
      </Link>
    </CardFrame>
  );
}
