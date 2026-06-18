import { CardFrame } from "../CardFrame";

export function GithubBadge({ href, enterIndex }: { href: string; enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-10}
      enterIndex={enterIndex}
      hoverScale={1.05}
      style={{ left: 30, top: 430, width: 50, height: 50 }}
      className="rounded-full bg-ink text-surface shadow-[0_4px_10px_rgba(36,30,23,0.2)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[44px] h-full w-full items-center justify-center text-[14px] font-semibold xl:text-[17px] 2xl:text-[20px]"
        aria-label="GitHub"
      >
        ⌥
      </a>
    </CardFrame>
  );
}
