import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostmarkLayer } from "@/components/home/bento/PostmarkLayer";

describe("PostmarkLayer", () => {
  const today = new Date("2026-06-17T00:00:00Z");

  it("renders three postmarks: TOKYO, SHANGHAI, LÜBECK", () => {
    render(<PostmarkLayer today={today} />);
    expect(screen.getByText("TOKYO")).toBeInTheDocument();
    expect(screen.getByText("SHANGHAI")).toBeInTheDocument();
    expect(screen.getByText("LÜBECK")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("2017")).toBeInTheDocument();
  });

  it("renders today's date as YYYY.MM.DD", () => {
    render(<PostmarkLayer today={today} />);
    expect(screen.getByText("2026.06.17")).toBeInTheDocument();
  });

  it("marks decorative layers as aria-hidden", () => {
    const { container } = render(<PostmarkLayer today={today} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
