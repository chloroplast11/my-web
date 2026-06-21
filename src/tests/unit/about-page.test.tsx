import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "@/app/(site)/about/page";

describe("/about page", () => {
  it("renders the identity, about, experience, and skills blocks", async () => {
    const ui = await AboutPage();
    render(ui);
    expect(
      screen.getByRole("heading", { name: /chuck chen/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^about$/i)).toBeInTheDocument();
    expect(screen.getByText(/^experience$/i)).toBeInTheDocument();
    expect(screen.getByText(/^skills$/i)).toBeInTheDocument();
  });

  it("lists the production-canon employers in the experience timeline", async () => {
    const ui = await AboutPage();
    render(ui);
    expect(screen.getAllByText(/alibaba/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bytedance/i).length).toBeGreaterThan(0);
  });
});
