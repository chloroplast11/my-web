import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function WriteCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      cardId="write"
      finalRotation={0}
      enterIndex={enterIndex}
      className="max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-auto max-md:!h-auto max-md:self-center max-md:order-6"
    >
      <Link
        href="/write"
        aria-label="write a new post"
        className="group flex h-full w-full items-center justify-center gap-2 rounded-lg border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] transition-transform duration-200 hover:scale-[1.03] max-md:px-6 max-md:py-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-accent xl:h-4 xl:w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
        <span className="font-serif text-[11px] italic leading-none text-ink transition-colors group-hover:text-accent xl:text-[13px] 2xl:text-[14px]">
          write
        </span>
      </Link>
    </CardFrame>
  );
}
