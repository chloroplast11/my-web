import type React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: React.ComponentProps<"div">) => <div {...props} />,
  },
}));

describe("ResizeHandles", () => {
  it("renders exactly 4 corner handles with stable data attributes for each corner", async () => {
    const { ResizeHandles } = await import(
      "@/components/home/bento/card-frame-resize-handles"
    );
    const onResize = vi.fn();
    const onCommit = vi.fn();
    const { container } = render(
      <ResizeHandles onResize={onResize} onCommit={onCommit} />,
    );
    const handles = container.querySelectorAll("[data-resize-handle]");
    expect(handles.length).toBe(4);
    const corners = Array.from(handles).map((el) =>
      el.getAttribute("data-resize-handle"),
    );
    expect(corners.sort()).toEqual(["bl", "br", "tl", "tr"]);
  });

  it("pointer-down on a handle does not bubble to ancestors (drag isolation)", async () => {
    const { ResizeHandles } = await import(
      "@/components/home/bento/card-frame-resize-handles"
    );
    const parentDown = vi.fn();
    const { container } = render(
      <div onPointerDown={parentDown}>
        <ResizeHandles onResize={vi.fn()} onCommit={vi.fn()} />
      </div>,
    );
    const br = container.querySelector('[data-resize-handle="br"]') as HTMLElement;
    br.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(parentDown).not.toHaveBeenCalled();
  });
});
