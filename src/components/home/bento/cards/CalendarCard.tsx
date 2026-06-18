import { CardFrame } from "../CardFrame";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
  const month = MONTHS[today.getMonth()];
  const year = today.getFullYear();
  const cells = buildMonthGrid(today);

  return (
    <CardFrame
      finalRotation={4}
      enterIndex={enterIndex}
      style={{ left: 295, top: 130, width: 160, height: 175 }}
      className="rounded-md border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="flex min-h-[170px] h-full w-full flex-col p-2.5 text-muted">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink xl:text-[12px] 2xl:text-[14px]">
            {month}
          </span>
          <span className="text-[8px] xl:text-[10px] 2xl:text-[12px]">{year}</span>
        </div>
        <div className="grid grid-cols-7 gap-y-[1px] text-center text-[7px] text-faint xl:text-[9px] 2xl:text-[10px]">
          {WEEKDAYS.map((w, i) => (
            <span key={`wd-${i}`} className="font-semibold">{w}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-[1px] text-center text-[8px] xl:text-[10px] 2xl:text-[12px]">
          {cells.map((d, i) =>
            d === null ? (
              <span key={i} />
            ) : d === day ? (
              <span
                key={i}
                className="mx-auto inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent font-semibold text-surface xl:h-4 xl:w-4 2xl:h-5 2xl:w-5"
              >
                {d}
              </span>
            ) : (
              <span key={i} className="text-ink">{d}</span>
            ),
          )}
        </div>
      </div>
    </CardFrame>
  );
}
