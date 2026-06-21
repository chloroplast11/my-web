import { describe, it, expect } from "vitest";

describe("CardFrame drag commit math", () => {
  it("translates a pointer offset in rendered pixels back to reference px and clamps to canvas", async () => {
    // We unit-test the clamp+scale helper exported alongside CardFrame.
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const refPos = clampAndScale(
      { x: 30, y: 130 },            // previous position in ref px
      { x: 220, y: 30 },            // pointer offset in rendered px
      { renderedWidth: 1100, cardW: 240, cardH: 230 }, // 1100px = xl breakpoint
    );
    // At xl the bento inner box is 1100 × 750, locked to the 880 × 600
    // reference aspect ratio. clampAndScale uses width-ratio (880 / 1100)
    // for both axes, so 220 px → 176 ref px and 30 px → 24 ref px.
    expect(refPos.x).toBe(30 + 176); // = 206
    expect(refPos.y).toBe(130 + 24); // = 154
  });

  it("clamps to right/bottom edges with the CLAMP_BUFFER overflow allowance", async () => {
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const { CLAMP_BUFFER } = await import("@/lib/bento-defaults");
    const refPos = clampAndScale(
      { x: 800, y: 590 },
      { x: 1000, y: 1000 },
      { renderedWidth: 880, cardW: 240, cardH: 230 },
    );
    expect(refPos.x).toBe(880 - 240 + CLAMP_BUFFER);
    expect(refPos.y).toBe(600 - 230 + CLAMP_BUFFER);
  });

  it("clamps to left/top edges with the CLAMP_BUFFER overflow allowance", async () => {
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const { CLAMP_BUFFER } = await import("@/lib/bento-defaults");
    const refPos = clampAndScale(
      { x: 30, y: 130 },
      { x: -1000, y: -1000 },
      { renderedWidth: 880, cardW: 240, cardH: 230 },
    );
    expect(refPos.x).toBe(-CLAMP_BUFFER);
    expect(refPos.y).toBe(-CLAMP_BUFFER);
  });
});
