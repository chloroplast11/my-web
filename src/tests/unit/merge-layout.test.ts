import { describe, it, expect } from "vitest";
import { mergeLayout } from "@/components/home/bento/merge-layout";
import { BENTO_DEFAULTS } from "@/lib/bento-defaults";

describe("mergeLayout", () => {
  it("returns a full CardBox for every card id when input is empty", () => {
    const out = mergeLayout({});
    expect(Object.keys(out).sort()).toEqual(Object.keys(BENTO_DEFAULTS).sort());
    for (const id of Object.keys(BENTO_DEFAULTS) as Array<keyof typeof BENTO_DEFAULTS>) {
      expect(out[id]).toEqual({
        x: BENTO_DEFAULTS[id].x,
        y: BENTO_DEFAULTS[id].y,
        w: BENTO_DEFAULTS[id].w,
        h: BENTO_DEFAULTS[id].h,
      });
    }
  });

  it("hydrates a legacy {x,y}-only entry with w/h from defaults", () => {
    const out = mergeLayout({ about: { x: 99, y: 88 } });
    expect(out.about).toEqual({
      x: 99,
      y: 88,
      w: BENTO_DEFAULTS.about.w,
      h: BENTO_DEFAULTS.about.h,
    });
  });

  it("preserves a fully-specified {x,y,w,h} entry as-is", () => {
    const out = mergeLayout({ blog: { x: 10, y: 20, w: 200, h: 100 } });
    expect(out.blog).toEqual({ x: 10, y: 20, w: 200, h: 100 });
  });

  it("fills defaults for cards absent from input while keeping present ones", () => {
    const out = mergeLayout({ music: { x: 1, y: 2, w: 200, h: 50 } });
    expect(out.music).toEqual({ x: 1, y: 2, w: 200, h: 50 });
    expect(out.about).toEqual({
      x: BENTO_DEFAULTS.about.x,
      y: BENTO_DEFAULTS.about.y,
      w: BENTO_DEFAULTS.about.w,
      h: BENTO_DEFAULTS.about.h,
    });
  });

  it("does not mutate the input layout", () => {
    const input = { about: { x: 5, y: 6 } };
    const before = JSON.stringify(input);
    mergeLayout(input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("includes 'write' in the merged layout with defaults when input is empty", () => {
    const out = mergeLayout({});
    expect(out.write).toEqual({
      x: BENTO_DEFAULTS.write.x,
      y: BENTO_DEFAULTS.write.y,
      w: BENTO_DEFAULTS.write.w,
      h: BENTO_DEFAULTS.write.h,
    });
  });

  it("preserves a fully-specified write entry as-is", () => {
    const out = mergeLayout({ write: { x: 100, y: 200, w: 140, h: 60 } });
    expect(out.write).toEqual({ x: 100, y: 200, w: 140, h: 60 });
  });
});
