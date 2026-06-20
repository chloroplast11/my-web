import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CardFrame } from "@/components/home/bento/CardFrame";

// Stub framer-motion so animation props don't interfere with style inspection.
const mockUseReducedMotion = vi.fn(() => true);
vi.mock("framer-motion", () => ({
  motion: { div: (props: React.ComponentProps<"div">) => <div {...props} /> },
  useReducedMotion: () => mockUseReducedMotion(),
}));

describe("CardFrame", () => {
  it("renders at the default position for the given cardId when no provider is mounted", () => {
    const { container } = render(
      <CardFrame cardId="about" enterIndex={0} finalRotation={0}>
        <span>x</span>
      </CardFrame>,
    );
    const root = container.firstChild as HTMLElement;
    // about default = { x: 30, y: 130, w: 240, h: 230 } against 880x600
    expect(root.style.left).toBe(`${(30 / 880) * 100}%`);
    expect(root.style.top).toBe(`${(130 / 600) * 100}%`);
    expect(root.style.width).toBe(`${(240 / 880) * 100}%`);
    expect(root.style.height).toBe(`${(230 / 600) * 100}%`);
  });
});
