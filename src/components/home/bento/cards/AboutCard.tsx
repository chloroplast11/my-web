import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function AboutCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-2}
      enterIndex={enterIndex}
      style={{ left: 30, top: 178, width: 175, height: 170 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <Link
        href="/about"
        className="flex h-full w-full flex-col justify-between p-3 font-semibold text-ink"
      >
        <span className="text-[13px]">about</span>
        <span className="text-[9px] font-normal text-muted">→</span>
      </Link>
    </CardFrame>
  );
}
