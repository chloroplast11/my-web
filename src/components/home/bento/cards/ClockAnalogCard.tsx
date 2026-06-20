"use client";

import { useEffect, useState } from "react";
import { CardFrame } from "../CardFrame";

function handStyle(rotation: number, length: number, width: number, color: string): React.CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${width}px`,
    height: `${length}px`,
    backgroundColor: color,
    transformOrigin: "center bottom",
    transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
  };
}

export function ClockAnalogCard({ enterIndex }: { enterIndex: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 1000);
    const init = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(init);
    };
  }, []);

  // Pre-mount: hands all point to 12 (rotation 0) so SSR/CSR markup matches.
  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const hourDeg = h * 30 + m / 2;
  const minuteDeg = m * 6 + s / 10;
  const secondDeg = s * 6;

  return (
    <CardFrame
      finalRotation={0}
      enterIndex={enterIndex}
      style={{ left: 660, top: 395, width: 120, height: 120 }}
      className="rounded-full border-2 border-ink bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.16)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div aria-label="clock (analog, local time)" className="relative h-full w-full">
        {/* hour markers */}
        <span className="absolute left-1/2 top-[6px] -translate-x-1/2 font-serif text-[9px] text-muted">12</span>
        <span className="absolute right-[6px] top-1/2 -translate-y-1/2 font-serif text-[9px] text-muted">3</span>
        <span className="absolute left-1/2 bottom-[6px] -translate-x-1/2 font-serif text-[9px] text-muted">6</span>
        <span className="absolute left-[6px] top-1/2 -translate-y-1/2 font-serif text-[9px] text-muted">9</span>
        {/* hands */}
        <span data-hand="hour" style={handStyle(hourDeg, 32, 2, "var(--color-ink)")} />
        <span data-hand="minute" style={handStyle(minuteDeg, 44, 1.5, "var(--color-ink)")} />
        <span data-hand="second" style={handStyle(secondDeg, 46, 1, "var(--color-cinnabar)")} />
        {/* pivot */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cinnabar"
        />
      </div>
    </CardFrame>
  );
}
