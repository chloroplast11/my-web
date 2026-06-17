import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GithubBadge } from "@/components/home/bento/cards/GithubBadge";

describe("GithubBadge", () => {
  it("links to the provided GitHub URL in a new tab", () => {
    render(
      <GithubBadge href="https://github.com/chloroplast11" enterIndex={6} />,
    );
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", "https://github.com/chloroplast11");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
