// src/tests/unit/card-frame.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardFrame } from "@/components/home/bento/CardFrame";

describe("CardFrame", () => {
  it("renders children inside a div", () => {
    const { getByText } = render(
      <CardFrame finalRotation={-2} enterIndex={0}>hello</CardFrame>,
    );
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("applies the final rotation as inline transform fallback", () => {
    const { container } = render(
      <CardFrame finalRotation={-2} enterIndex={0}>x</CardFrame>,
    );
    const root = container.firstChild as HTMLElement;
    // motion.div sets style.transform — we assert the final rotation appears
    expect(root.style.transform).toContain("rotate(-2deg)");
  });

  it("merges custom className and style", () => {
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
