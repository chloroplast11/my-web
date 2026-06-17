import { CardFrame } from "../CardFrame";

export function GithubBadge({ href, enterIndex }: { href: string; enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-8}
      enterIndex={enterIndex}
      style={{ left: 498, top: 296, width: 50, height: 50 }}
      className="rounded-full bg-ink text-surface shadow-[0_4px_10px_rgba(36,30,23,0.2)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[44px] h-full w-full items-center justify-center text-[14px] font-semibold"
        aria-label="GitHub"
      >
        ⌥
      </a>
    </CardFrame>
  );
}
