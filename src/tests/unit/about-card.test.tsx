import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";

describe("AboutCard", () => {
  it("renders an internal link to /about with 'about' label", () => {
    render(<AboutCard enterIndex={0} />);
    const link = screen.getByRole("link", { name: /about/i });
    expect(link).toHaveAttribute("href", "/about");
  });
});
