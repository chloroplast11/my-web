import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "@/app/(site)/about/page";

describe("/about page", () => {
  it("renders the identity, now, skills, and contact blocks", async () => {
    const ui = await AboutPage();
    render(ui);
    expect(screen.getByRole("heading", { name: /chuck chen/i })).toBeInTheDocument();
    expect(screen.getByText(/now/i)).toBeInTheDocument();
    expect(screen.getByText(/skills/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it("links to the configured github profile", async () => {
    const ui = await AboutPage();
    render(ui);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("github.com"));
  });
});
