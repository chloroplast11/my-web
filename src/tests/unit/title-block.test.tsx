import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TitleBlock } from "@/components/home/bento/TitleBlock";

describe("TitleBlock", () => {
  it("renders 'Chuck Chen.' with accent-colored period", () => {
    render(<TitleBlock />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Chuck Chen.");
    const dot = heading.querySelector("[data-accent]");
    expect(dot?.textContent).toBe(".");
  });

  it("renders the tagline below the title", () => {
    render(<TitleBlock />);
    expect(
      screen.getByText(/a quiet corner of the internet/i),
    ).toBeInTheDocument();
  });
});
