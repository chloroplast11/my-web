import { BENTO_REF_W, BENTO_REF_H } from "./BentoStage";

type Postmark = {
  city: string;
  year: string;
  country: string;
  size: number;
  left: number;
  top: number;
  rotate: number;
  opacity: number;
};

// Coords are expressed in the bento reference box (880×380) and converted to
// percentages so they track the container as it grows on wider breakpoints.
const pctW = (n: number) => `${(n / BENTO_REF_W) * 100}%`;
const pctH = (n: number) => `${(n / BENTO_REF_H) * 100}%`;

const POSTMARKS: readonly Postmark[] = [
  // y stays in the top safety band (14–115) so the larger Photos card (y 130+)
  // does not clip the stamps. Inner text is counter-rotated for crispness so
  // the postmark itself can carry a livelier tilt.
  { city: "TOKYO",    year: "2025", country: "JAPAN",   size: 76, left: 760, top: 14, rotate: -8,  opacity: 0.7  },
  { city: "SHANGHAI", year: "2014", country: "CHINA",   size: 70, left: 430, top: 28, rotate: 12, opacity: 0.55 },
  { city: "LÜBECK",   year: "2017", country: "GERMANY", size: 72, left: 600, top: 42, rotate: -14, opacity: 0.5  },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function PostmarkLayer({ today }: { today: Date }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none col-span-2 mb-4 flex justify-center gap-2 md:absolute md:inset-0 md:mb-0 md:block"
    >
      {POSTMARKS.map((p) => (
        <div
          key={p.city}
          className="rounded-full border-2 border-accent text-accent max-md:!static max-md:!w-14 max-md:!h-14 md:absolute"
          style={{
            left: pctW(p.left),
            top: pctH(p.top),
            width: pctW(p.size),
            height: pctH(p.size),
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {/* Counter-rotate the text so the round border keeps its tilt but
              the letters land on the pixel grid axis-aligned. */}
          <div
            className="flex h-full w-full flex-col items-center justify-center font-serif"
            style={{ transform: `rotate(${-p.rotate}deg)` }}
          >
            <div className="text-[8px] font-semibold tracking-[0.18em] xl:text-[10px] 2xl:text-[12px]">{p.city}</div>
            <div className="my-0.5 text-[15px] font-bold leading-none xl:text-[18px] 2xl:text-[22px]">{p.year}</div>
            <div className="text-[7px] tracking-[0.12em] xl:text-[9px] 2xl:text-[11px]">{p.country}</div>
          </div>
        </div>
      ))}
      <div
        className="hidden font-serif text-[13px] italic text-muted md:absolute md:bottom-2 md:right-7 md:block xl:text-[15px] 2xl:text-[18px]"
        style={{ opacity: 0.55, transform: "rotate(-4deg)" }}
      >
        {/* Date stamp text is short so subpixel blur is acceptable here;
            keep it simple and skip the wrapper. */}
        {formatDate(today)}
      </div>
    </div>
  );
}
