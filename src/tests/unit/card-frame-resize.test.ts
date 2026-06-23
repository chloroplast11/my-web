import { describe, it, expect } from "vitest";
import { CLAMP_BUFFER } from "@/lib/bento-defaults";

describe("clampAndScaleResize", () => {
  it("br corner: positive offset grows w and h, leaves x and y untouched", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "br",
      { x: 110, y: 60 }, // rendered px at 880px viewport => 110 ref-px, 60 ref-px
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    expect(next).toEqual({ x: 30, y: 130, w: 350, h: 290 });
  });

  it("tl corner: positive offset shrinks w/h and shifts x/y inward", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "tl",
      { x: 40, y: 20 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    // Right/bottom edges of the input box: x+w=270, y+h=360.
    // After tl drag by (40,20): nextX=70, nextY=150, nextW=200, nextH=210.
    // Right edge stays: 70+200=270 ✓. Bottom: 150+210=360 ✓.
    expect(next).toEqual({ x: 70, y: 150, w: 200, h: 210 });
  });

  it("tr corner: only y and w/h change; x stays", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "tr",
      { x: 50, y: 30 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    expect(next).toEqual({ x: 30, y: 160, w: 290, h: 200 });
  });

  it("bl corner: only x and w/h change; y stays", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "bl",
      { x: 40, y: 20 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    expect(next).toEqual({ x: 70, y: 130, w: 200, h: 250 });
  });

  it("tl: shrinking below minW pins w at minW and re-anchors x so the right edge stays put", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "tl",
      { x: 500, y: 0 }, // would shove w deep below minW
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    // Right edge of original: 30+240=270. With w pinned to minW=160,
    // nextX must equal 270 - 160 = 110.
    expect(next.w).toBe(160);
    expect(next.x).toBe(110);
    expect(next.x + next.w).toBe(270);
  });

  it("tr: shrinking h below minH pins h and re-anchors y so the bottom edge stays put", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "tr",
      { x: 0, y: 500 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    // Bottom edge of original: 130+230=360. With h=minH=160, nextY=200.
    expect(next.h).toBe(160);
    expect(next.y).toBe(200);
    expect(next.y + next.h).toBe(360);
  });

  it("br: growing past the right edge clamps so x + w stays within BENTO_REF_W + CLAMP_BUFFER", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "br",
      { x: 5000, y: 0 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    // x is unchanged at 30, so w gets capped by maxX rule:
    //   nextX + nextW ≤ BENTO_REF_W + CLAMP_BUFFER
    //   30 + nextW ≤ 880 + 120  ⇒  nextW ≤ 970.
    // The hard width cap (BENTO_REF_W + 2 * CLAMP_BUFFER = 1120) is looser,
    // so the position clamp wins here through nextX clipping. Verify the
    // invariant directly.
    expect(next.x + next.w).toBeLessThanOrEqual(880 + CLAMP_BUFFER);
  });

  it("rounds fractional pixel offsets to integers in the output", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const next = clampAndScaleResize(
      { x: 30, y: 130, w: 240, h: 230 },
      "br",
      { x: 10.7, y: 5.4 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    expect(Number.isInteger(next.x)).toBe(true);
    expect(Number.isInteger(next.y)).toBe(true);
    expect(Number.isInteger(next.w)).toBe(true);
    expect(Number.isInteger(next.h)).toBe(true);
  });

  it("zero offset returns the box unchanged", async () => {
    const { clampAndScaleResize } = await import(
      "@/components/home/bento/card-frame-resize"
    );
    const prev = { x: 30, y: 130, w: 240, h: 230 };
    const next = clampAndScaleResize(
      prev,
      "br",
      { x: 0, y: 0 },
      { renderedWidth: 880, minW: 160, minH: 160 },
    );
    expect(next).toEqual(prev);
  });
});
