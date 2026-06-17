import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";

describe("HanabiCard", () => {
  it("links to the external hanabi site in a new tab", () => {
    render(<HanabiCard enterIndex={5} />);
    const link = screen.getByRole("link", { name: /花火|hanabi/i });
    expect(link).toHaveAttribute("href", "https://hanabi.chuckchen.org/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
