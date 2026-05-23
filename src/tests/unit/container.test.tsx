import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Container } from "@/components/ui/Container";

describe("Container", () => {
  it("renders children inside a centered max-width wrapper with horizontal padding", () => {
    const { container } = render(<Container><p>hi</p></Container>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/mx-auto/);
    expect(root.className).toMatch(/max-w-\[var\(--container-site\)\]/);
    expect(root.className).toMatch(/px-\[5vw\]/);
    expect(root.textContent).toBe("hi");
  });

  it("merges extra className without dropping defaults", () => {
    const { container } = render(<Container className="py-32">x</Container>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/py-32/);
    expect(root.className).toMatch(/mx-auto/);
  });

  it("renders as <section> by default and accepts an `as` override", () => {
    const { container, rerender } = render(<Container>x</Container>);
    expect((container.firstChild as HTMLElement).tagName).toBe("SECTION");
    rerender(<Container as="main">x</Container>);
    expect((container.firstChild as HTMLElement).tagName).toBe("MAIN");
  });
});
