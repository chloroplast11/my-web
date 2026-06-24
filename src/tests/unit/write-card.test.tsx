import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WriteCard } from "@/components/home/bento/cards/WriteCard";

describe("WriteCard", () => {
  it("renders an internal link to /write", () => {
    render(<WriteCard enterIndex={9} />);
    const link = screen.getByRole("link", { name: /write/i });
    expect(link).toHaveAttribute("href", "/write");
  });

  it("renders the 'write' label", () => {
    render(<WriteCard enterIndex={9} />);
    expect(screen.getByText(/^write$/i)).toBeInTheDocument();
  });

  it("renders a decorative pen icon (svg)", () => {
    const { container } = render(<WriteCard enterIndex={9} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
