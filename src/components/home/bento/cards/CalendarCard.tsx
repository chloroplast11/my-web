import { CardFrame } from "../CardFrame";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CalendarCard({ today, enterIndex }: { today: Date; enterIndex: number }) {
  const day = today.getDate();
  const month = MONTHS[today.getMonth()];

  return (
    <CardFrame
      finalRotation={3}
      enterIndex={enterIndex}
      style={{ left: 225, top: 190, width: 105, height: 105 }}
      className="rounded-md border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto"
    >
      <div className="flex min-h-[80px] h-full w-full flex-col items-start justify-between p-3 text-muted">
        <span className="text-[9px] uppercase tracking-widest">{month}</span>
        <span className="self-end text-[28px] font-bold leading-none text-ink">{day}</span>
      </div>
    </CardFrame>
  );
}
