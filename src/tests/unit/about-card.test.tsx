import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";

describe("AboutCard", () => {
  it("renders an internal link to /about", () => {
    render(<AboutCard enterIndex={0} />);
    const link = screen.getByRole("link", { name: /about/i });
    expect(link).toHaveAttribute("href", "/about");
  });

  it("renders the author-card label and seal", () => {
    render(<AboutCard enterIndex={0} />);
    expect(screen.getByText(/author card/i)).toBeInTheDocument();
    expect(screen.getByText(/EST\./i)).toBeInTheDocument();
    expect(screen.getByText("1995")).toBeInTheDocument();
  });

  it("renders name and role", () => {
    render(<AboutCard enterIndex={0} />);
    expect(screen.getByText("Chuck Chen")).toBeInTheDocument();
    expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
  });
});
