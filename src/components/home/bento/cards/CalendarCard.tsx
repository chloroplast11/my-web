import { CardFrame } from "../CardFrame";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]; // Sunday-first

function buildMonthGrid(today: Date): (number | null)[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarCard({ today, enterIndex }: { today: Date; enterIndex: number }) {
  const day = today.getDate();
  const monthShort = MONTHS_SHORT[today.getMonth()];
  const year = today.getFullYear();
  const cells = buildMonthGrid(today);

  return (
    <CardFrame
      finalRotation={0}
      enterIndex={enterIndex}
      style={{ left: 350, top: 130, width: 160, height: 175 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="flex h-full w-full flex-col p-3 font-serif">
        <div className="flex items-baseline justify-between border-b-[1.5px] border-accent pb-1">
          <span className="text-[13px] font-bold text-ink xl:text-[15px] 2xl:text-[17px]">
            {monthShort}
          </span>
          <span className="font-mono text-[9px] text-muted xl:text-[11px] 2xl:text-[13px]">{year}</span>
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-y-[1px] text-center text-[8px] font-bold text-cinnabar xl:text-[10px] 2xl:text-[11px]">
          {WEEKDAYS.map((w, i) => (
            <span key={`wd-${i}`}>{w}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-[1px] text-center text-[8px] xl:text-[10px] 2xl:text-[12px]">
          {cells.map((d, i) => {
            if (d === null) return <span key={i} />;
            const isToday = d === day;
            const col = i % 7;
            const isWeekend = col === 0 || col === 6;
            if (isToday) {
              return (
                <span
                  key={i}
                  className="mx-auto inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink font-bold text-surface-2 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5"
                >
                  {d}
                </span>
              );
            }
            return (
              <span key={i} className={isWeekend ? "text-cinnabar/80" : "text-ink"}>
                {d}
              </span>
            );
          })}
        </div>
      </div>
    </CardFrame>
  );
}
