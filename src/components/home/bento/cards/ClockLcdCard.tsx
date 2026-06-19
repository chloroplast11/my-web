"use client";

import { useEffect, useState } from "react";
import { CardFrame } from "../CardFrame";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function ClockLcdCard({ enterIndex }: { enterIndex: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? pad(now.getHours()) : "--";
  const mm = now ? pad(now.getMinutes()) : "--";
  const ss = now ? pad(now.getSeconds()) : "--";

  return (
    <CardFrame
      finalRotation={-1}
      enterIndex={enterIndex}
      style={{ left: 350, top: 330, width: 200, height: 80 }}
      className="rounded-lg max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div
        aria-label="clock (digital, local time)"
        className="flex h-full w-full items-center justify-center rounded-lg p-[6px] shadow-[0_4px_10px_rgba(36,30,23,0.2)]"
        style={{ backgroundColor: "#1a1410", boxShadow: "0 4px 10px rgba(36,30,23,0.2), inset 0 0 0 2px #3a2f24" }}
      >
        <div
          className="flex h-full w-full items-baseline justify-center rounded gap-1 font-mono"
          style={{
            backgroundColor: "#2a2018",
            color: "#f5b96b",
            textShadow: "0 0 6px rgba(245,185,107,0.6)",
            fontFamily: '"Courier New", ui-monospace, monospace',
          }}
        >
          <span className="text-[30px] font-bold leading-none xl:text-[34px] 2xl:text-[40px]">
            {hh + ":" + mm}
          </span>
          <span className="text-[14px] font-bold leading-none opacity-70 xl:text-[16px] 2xl:text-[18px]">
            {":" + ss}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
