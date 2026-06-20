// src/tests/unit/bento-stage.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoStage } from "@/components/home/bento/BentoStage";

describe("BentoStage", () => {
  it("renders a centered container at max-width 880px", () => {
    const { container } = render(<BentoStage initialLayout={{}}><span>x</span></BentoStage>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/mx-auto/);
    expect(root.className).toMatch(/max-w-\[880px\]/);
    expect(root.className).toMatch(/min-h-screen/);
    expect(root.textContent).toBe("x");
  });
});
