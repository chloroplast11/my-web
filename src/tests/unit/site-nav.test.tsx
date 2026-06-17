import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";

describe("SiteNav", () => {
  it("renders nothing on the home route", () => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/");
    const { container } = render(<SiteNav />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the nav on other routes", () => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/blog");
    render(<SiteNav />);
    expect(screen.getByText(/Chuck/)).toBeInTheDocument();
  });
});
