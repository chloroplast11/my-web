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

const POSTMARKS: readonly Postmark[] = [
  { city: "TOKYO",    year: "2025", country: "JAPAN",   size: 82, left: 740, top: 46, rotate: -8,  opacity: 0.7  },
  { city: "SHANGHAI", year: "2014", country: "CHINA",   size: 72, left: 430, top: 60, rotate: 12,  opacity: 0.55 },
  { city: "LÜBECK",   year: "2017", country: "GERMANY", size: 76, left: 590, top: 80, rotate: -14, opacity: 0.5  },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function PostmarkLayer({ today }: { today: Date }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {POSTMARKS.map((p) => (
        <div
          key={p.city}
          className="absolute flex flex-col items-center justify-center rounded-full border-2 border-accent font-serif text-accent"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <div className="text-[8px] font-semibold tracking-[0.18em]">{p.city}</div>
          <div className="my-0.5 text-[17px] font-bold leading-none">{p.year}</div>
          <div className="text-[7px] tracking-[0.12em]">{p.country}</div>
        </div>
      ))}
      <div
        className="absolute bottom-2 right-7 font-serif text-[13px] italic text-muted"
        style={{ opacity: 0.55, transform: "rotate(-4deg)" }}
      >
        {formatDate(today)}
      </div>
    </div>
  );
}
