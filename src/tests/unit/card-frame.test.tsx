// src/tests/unit/card-frame.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CardFrame } from "@/components/home/bento/CardFrame";

// Mock framer-motion's useReducedMotion so we can control it per-test.
// vi.mock is hoisted above imports by Vitest; the factory runs once and
// the returned `mockUseReducedMotion` reference is shared across tests.
const mockUseReducedMotion = vi.fn(() => false);

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

describe("CardFrame", () => {
  it("renders children inside a div", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { getByText } = render(
      <CardFrame finalRotation={-2} enterIndex={0}>hello</CardFrame>,
    );
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("applies the final rotation via inline transform when motion is reduced", () => {
    mockUseReducedMotion.mockReturnValue(true);
    try {
      const { container } = render(
        <CardFrame finalRotation={-2} enterIndex={0}>x</CardFrame>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.style.transform).toContain("rotate(-2deg)");
    } finally {
      mockUseReducedMotion.mockReturnValue(false);
    }
  });

  it("merges custom className and style", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { container } = render(
      <CardFrame
        finalRotation={3}
        enterIndex={1}
        className="custom"
        style={{ left: 10, top: 20 }}
      >
        x
      </CardFrame>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/custom/);
    expect(root.style.left).toBe("10px");
    expect(root.style.top).toBe("20px");
  });
});
