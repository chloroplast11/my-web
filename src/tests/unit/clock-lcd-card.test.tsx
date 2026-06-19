import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ClockLcdCard } from "@/components/home/bento/cards/ClockLcdCard";

describe("ClockLcdCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T14:00:23"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("server-renders --:-- placeholder (no real digits)", () => {
    const html = renderToString(<ClockLcdCard enterIndex={0} />);
    expect(html).toContain("--:--");
    expect(html).toContain(":--");
    expect(html).not.toMatch(/\b\d\d:\d\d\b/);
  });

  it("shows live local time after client mount", () => {
    render(<ClockLcdCard enterIndex={0} />);
    expect(screen.getByText(/14:00/)).toBeInTheDocument();
    expect(screen.getByText(/:23/)).toBeInTheDocument();
  });

  it("updates seconds on tick", async () => {
    render(<ClockLcdCard enterIndex={0} />);
    expect(screen.getByText(/:23/)).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/:24/)).toBeInTheDocument();
  });
});
