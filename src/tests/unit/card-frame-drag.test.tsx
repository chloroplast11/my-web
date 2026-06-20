import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CardFrame } from "@/components/home/bento/CardFrame";
import { BentoLayoutContext } from "@/components/home/bento/BentoLayoutContext";
import type { CardId, Position } from "@/lib/bento-defaults";

// Reduced motion → CardFrame's plain-div branch ignores motion props, but it
// still must wire onMouseUp/onDragEnd-equivalent through. We test the math by
// poking the public hook (setCardPosition) via the provider.

describe("CardFrame drag commit math", () => {
  it("translates a pointer offset in rendered pixels back to reference px and clamps to canvas", async () => {
    // We unit-test the clamp+scale helper exported alongside CardFrame.
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const refPos = clampAndScale(
      { x: 30, y: 130 },            // previous position in ref px
      { x: 220, y: 30 },            // pointer offset in rendered px
      { renderedWidth: 1100, cardW: 240, cardH: 230 }, // 1100px = xl breakpoint
    );
    // 220 rendered px * (880 / 1100) = 176 ref px; y similarly: 30 * (600/750)? — height scale derives from BENTO_REF_H/H
    // For xl, BentoStage container is 1100 wide × 750 tall (per Round A).
    // We use width ratio for both axes since the bento inner aspect ratio is
    // locked (Round B keeps the same 880:600 reference). So 30 * (880/1100) = 24
    expect(refPos.x).toBe(30 + 176);            // = 206
    expect(refPos.y).toBe(130 + 24);            // = 154
  });

  it("clamps to canvas right/bottom edges", async () => {
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const refPos = clampAndScale(
      { x: 800, y: 590 },
      { x: 1000, y: 1000 },
      { renderedWidth: 880, cardW: 240, cardH: 230 },
    );
    expect(refPos.x).toBe(880 - 240);  // = 640
    expect(refPos.y).toBe(600 - 230);  // = 370
  });

  it("clamps to canvas left/top edges", async () => {
    const { clampAndScale } = await import("@/components/home/bento/card-frame-drag");
    const refPos = clampAndScale(
      { x: 30, y: 130 },
      { x: -1000, y: -1000 },
      { renderedWidth: 880, cardW: 240, cardH: 230 },
    );
    expect(refPos.x).toBe(0);
    expect(refPos.y).toBe(0);
  });
});
