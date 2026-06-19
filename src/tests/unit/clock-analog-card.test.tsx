import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ClockAnalogCard } from "@/components/home/bento/cards/ClockAnalogCard";

describe("ClockAnalogCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T03:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders three hands after mount", () => {
    const { container } = render(<ClockAnalogCard enterIndex={0} />);
    expect(container.querySelector('[data-hand="hour"]')).not.toBeNull();
    expect(container.querySelector('[data-hand="minute"]')).not.toBeNull();
    expect(container.querySelector('[data-hand="second"]')).not.toBeNull();
  });

  it("hour hand at 03:00 is rotated 90 degrees", async () => {
    const { container } = render(<ClockAnalogCard enterIndex={0} />);
    await act(async () => { vi.advanceTimersByTime(0); });
    const hour = container.querySelector('[data-hand="hour"]') as HTMLElement;
    // hour rotation = (hours % 12) * 30 + (minutes / 2) -> 03:00 = 90deg
    expect(hour.style.transform).toContain("rotate(90deg)");
  });

  it("second hand advances on tick", async () => {
    const { container } = render(<ClockAnalogCard enterIndex={0} />);
    const second = container.querySelector('[data-hand="second"]') as HTMLElement;
    const t0 = second.style.transform;
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    const t1 = second.style.transform;
    expect(t1).not.toBe(t0);
  });
});
