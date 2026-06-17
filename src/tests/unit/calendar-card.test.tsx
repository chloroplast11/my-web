import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CalendarCard } from "@/components/home/bento/cards/CalendarCard";

describe("CalendarCard", () => {
  it("renders today's day-of-month number", () => {
    render(<CalendarCard today={new Date("2026-06-17T00:00:00Z")} enterIndex={1} />);
    expect(screen.getByText("17")).toBeInTheDocument();
  });

  it("renders the month abbreviation", () => {
    render(<CalendarCard today={new Date("2026-06-17T00:00:00Z")} enterIndex={1} />);
    expect(screen.getByText(/jun/i)).toBeInTheDocument();
  });
});
