# Bento Card Resize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4-corner resize handles to bento cards in edit mode, persist `{w, h}` alongside `{x, y}`, and fix latent drag jitter.

**Architecture:** Extend the existing framer-motion drag implementation. Reuse the `dragX/dragY` motion-value pattern for `sizeDW/sizeDH`. New `ResizeHandles` component renders 4 corner handles inside `CardFrame`'s outer `motion.div`; each handle uses `onPan` for realtime tracking and `onPanEnd` to commit a clamped `{x, y, w, h}` to the layout context. Position type `Position` becomes `CardBox` with the same wire-level JSON field name (`positions`) for backward compatibility with existing saved blobs.

**Tech Stack:** TypeScript, React 19, Next.js 16, framer-motion 12.40, Zod, Tailwind, Prisma, vitest, `@testing-library/react`.

## Global Constraints

- All position/size integers are in the **bento reference canvas** `880 × 600` (`BENTO_REF_W` × `BENTO_REF_H`).
- Outer overflow allowance: `CLAMP_BUFFER = 120` ref-px per side (unchanged).
- Global size floor: `w ≥ 40`, `h ≥ 40` (Zod hard min). Per-card `minW`/`minH` enforced by `clampAndScaleResize` are ≥ this floor.
- Edit mode is **desktop-only** (`md+` viewports). `useReducedMotion()` disables both drag and resize handles.
- The JSON wire field stays named `positions` to preserve back-compat with old saved blobs. Only the inner value shape grows.
- Test command: `pnpm test` (vitest run). Typecheck: `pnpm typecheck`. Dev server: `pnpm dev`.
- Commits are atomic per task. No `--no-verify`, no skipping hooks.

---

### Task 1: Extend types, schemas, and consumers (no behavior change)

This is a mechanical migration. After this task, the codebase compiles, all existing tests pass, but the system still behaves exactly as before — drag commits effectively leave `w/h` unchanged because nothing yet writes to them. The point is to land the shape change atomically so subsequent tasks can build on it.

**Files:**
- Modify: `src/lib/bento-defaults.ts`
- Modify: `src/components/home/bento/BentoLayoutContext.ts`
- Modify: `src/components/home/bento/EditableBento.tsx`
- Modify: `src/components/home/bento/CardFrame.tsx` (the `handleDragEnd` call only)
- Modify: `src/components/home/bento/EditToolbar.tsx` (type imports only)
- Modify: `src/lib/db/bento-layout.ts`
- Modify: `src/app/api/bento-layout/route.ts`
- Modify: `src/tests/unit/bento-layout-api.test.ts`
- Modify: `src/tests/unit/bento-layout-db.test.ts`
- Modify: `src/tests/unit/edit-toolbar.test.tsx`
- Modify: `src/tests/unit/card-frame.test.tsx` (no changes expected — verify after)
- Modify: `src/tests/unit/editable-bento.test.tsx` (no changes expected — verify after)

**Interfaces produced:**
- `type CardBox = { x: number; y: number; w: number; h: number }`
- `type CardDefaults = { x, y, w, h, minW, minH }`
- `type Layout = Partial<Record<CardId, CardBox>>`
- `BENTO_DEFAULTS: Record<CardId, CardDefaults>` — each card has `minW`/`minH`
- `cardBoxReadSchema` (w/h optional), `cardBoxWriteSchema` (w/h required)
- `layoutReadSchema`, `layoutWriteSchema`
- `BentoLayoutContextValue.setCardBox(id: CardId, box: CardBox): void` (replaces `setCardPosition`)

- [ ] **Step 1: Rewrite `src/lib/bento-defaults.ts`**

Replace the file contents with:

```ts
import { z } from "zod";

export const CARD_IDS = [
  "about",
  "calendar",
  "music",
  "photos",
  "blog",
  "hanabi",
  "clock-lcd",
  "clock-analog",
  "likes",
] as const;

export type CardId = (typeof CARD_IDS)[number];

// A card's persisted box: position AND size, in ref-canvas px.
export type CardBox = { x: number; y: number; w: number; h: number };
export type Layout = Partial<Record<CardId, CardBox>>;

// `minW` / `minH` are the per-card lower bounds enforced by resize.
export type CardDefaults = {
  x: number; y: number;
  w: number; h: number;
  minW: number; minH: number;
};

export const BENTO_REF_W = 880;
export const BENTO_REF_H = 600;

// How far a dragged or resized card may overflow the canvas, in ref px.
export const CLAMP_BUFFER = 120;

export const BENTO_DEFAULTS: Record<CardId, CardDefaults> = Object.freeze({
  about:          { x:  30, y: 130, w: 240, h: 230, minW: 160, minH: 160 },
  calendar:       { x: 350, y: 130, w: 160, h: 175, minW: 120, minH: 140 },
  photos:         { x: 605, y: 130, w: 250, h: 245, minW: 160, minH: 160 },
  "clock-lcd":    { x: 350, y: 330, w: 200, h:  80, minW: 140, minH:  60 },
  blog:           { x:  30, y: 390, w: 290, h: 170, minW: 200, minH: 120 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120, minW:  80, minH:  80 },
  music:          { x: 340, y: 450, w: 260, h:  56, minW: 180, minH:  44 },
  hanabi:         { x: 350, y: 532, w: 220, h:  65, minW: 140, minH:  50 },
  likes:          { x: 790, y: 440, w:  80, h:  85, minW:  60, minH:  60 },
}) as Record<CardId, CardDefaults>;

// Shared x/y constraints reused by both read and write schemas.
const xyShape = {
  x: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_W + CLAMP_BUFFER),
  y: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_H + CLAMP_BUFFER),
};
const wField = z.number().int().min(40).max(BENTO_REF_W + 2 * CLAMP_BUFFER);
const hField = z.number().int().min(40).max(BENTO_REF_H + 2 * CLAMP_BUFFER);

// Read schema tolerates legacy saved blobs that contain only {x, y}.
export const cardBoxReadSchema = z.object({
  ...xyShape,
  w: wField.optional(),
  h: hField.optional(),
});

// Write schema requires the full box — used by the PUT API.
export const cardBoxWriteSchema = z.object({
  ...xyShape,
  w: wField,
  h: hField,
});

export const layoutReadSchema = z.object({
  about: cardBoxReadSchema.optional(),
  calendar: cardBoxReadSchema.optional(),
  music: cardBoxReadSchema.optional(),
  photos: cardBoxReadSchema.optional(),
  blog: cardBoxReadSchema.optional(),
  hanabi: cardBoxReadSchema.optional(),
  "clock-lcd": cardBoxReadSchema.optional(),
  "clock-analog": cardBoxReadSchema.optional(),
  likes: cardBoxReadSchema.optional(),
});

export const layoutWriteSchema = z.object({
  about: cardBoxWriteSchema.optional(),
  calendar: cardBoxWriteSchema.optional(),
  music: cardBoxWriteSchema.optional(),
  photos: cardBoxWriteSchema.optional(),
  blog: cardBoxWriteSchema.optional(),
  hanabi: cardBoxWriteSchema.optional(),
  "clock-lcd": cardBoxWriteSchema.optional(),
  "clock-analog": cardBoxWriteSchema.optional(),
  likes: cardBoxWriteSchema.optional(),
});
```

- [ ] **Step 2: Update `src/components/home/bento/BentoLayoutContext.ts`**

Replace the file with:

```ts
"use client";

import { createContext, useContext } from "react";
import type { CardId, CardBox } from "@/lib/bento-defaults";

export type BentoLayoutContextValue = {
  layout: Record<CardId, CardBox>;
  setCardBox: (id: CardId, box: CardBox) => void;
  editMode: boolean;
};

export const BentoLayoutContext = createContext<BentoLayoutContextValue | null>(null);

export function useBentoLayout(): BentoLayoutContextValue | null {
  return useContext(BentoLayoutContext);
}
```

- [ ] **Step 3: Update `src/components/home/bento/EditableBento.tsx`**

Two changes:

- `mergeLayout` must fill `w/h` from defaults when missing.
- Rename `setCardPosition` → `setCardBox`, signature widens.

In the imports at the top, change `Position` to `CardBox`:

```ts
import {
  BENTO_DEFAULTS,
  BENTO_REF_H,
  BENTO_REF_W,
  CLAMP_BUFFER,
  type CardId,
  type Layout,
  type CardBox,
} from "@/lib/bento-defaults";
```

Replace `mergeLayout`:

```ts
function mergeLayout(initial: Layout): Record<CardId, CardBox> {
  const out: Record<CardId, CardBox> = {} as Record<CardId, CardBox>;
  for (const id of Object.keys(BENTO_DEFAULTS) as CardId[]) {
    const def = BENTO_DEFAULTS[id];
    const saved = initial[id];
    out[id] = {
      x: saved?.x ?? def.x,
      y: saved?.y ?? def.y,
      w: saved?.w ?? def.w,
      h: saved?.h ?? def.h,
    };
  }
  return out;
}
```

Replace the state types and the setter:

```ts
const [layout, setLayout] = useState<Record<CardId, CardBox>>(() => mergeLayout(initialLayout));
const [serverLayout, setServerLayout] = useState<Record<CardId, CardBox>>(() =>
  mergeLayout(initialLayout),
);
```

```ts
const setCardBox = useCallback((id: CardId, box: CardBox) => {
  setLayout((prev) => ({ ...prev, [id]: box }));
}, []);
```

Replace the context value memo:

```ts
const value = useMemo(
  () => ({ layout, setCardBox, editMode }),
  [layout, setCardBox, editMode],
);
```

- [ ] **Step 4: Update `src/components/home/bento/CardFrame.tsx` (drag commit only)**

In `handleDragEnd`, drag must preserve `w/h` while updating `x/y`. Replace the function:

```ts
function handleDragEnd(_e: unknown, info: PanInfo) {
  if (!ctx) return;
  const parent = ref.current?.parentElement;
  const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
  const next = clampAndScale(pos, info.offset, {
    renderedWidth,
    cardW: pos.w,
    cardH: pos.h,
  });
  ctx.setCardBox(cardId, { ...pos, x: next.x, y: next.y });
}
```

Note: `clampAndScale`'s `cardW`/`cardH` args now read from `pos.w`/`pos.h` (the current box) rather than the defaults — this is correct for the future where size may differ from defaults. Drag math is otherwise unchanged.

- [ ] **Step 5: Update `src/components/home/bento/EditToolbar.tsx` (types only)**

Update the `Position` import to `CardBox`:

```ts
import type { CardId, Layout, CardBox } from "@/lib/bento-defaults";
```

Update the prop type:

```ts
currentLayout: Record<CardId, CardBox>;
```

- [ ] **Step 6: Update `src/lib/db/bento-layout.ts`**

Use the read schema for reads. Behavior is unchanged for write (write schema is enforced at the API layer):

```ts
import { prisma } from "@/lib/prisma";
import { layoutReadSchema, type Layout } from "@/lib/bento-defaults";

const LAYOUT_ID = "default";

export async function getBentoLayout(): Promise<Layout> {
  const row = await prisma.bentoLayout.findUnique({ where: { id: LAYOUT_ID } });
  if (!row) return {};
  const parsed = layoutReadSchema.safeParse(row.positions);
  return parsed.success ? parsed.data : {};
}

export async function setBentoLayout(positions: Layout): Promise<Layout> {
  const row = await prisma.bentoLayout.upsert({
    where: { id: LAYOUT_ID },
    create: { id: LAYOUT_ID, positions },
    update: { positions },
  });
  const parsed = layoutReadSchema.safeParse(row.positions);
  return parsed.success ? parsed.data : positions;
}
```

- [ ] **Step 7: Update `src/app/api/bento-layout/route.ts`**

Switch the PUT schema to `layoutWriteSchema`:

```ts
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getBentoLayout, setBentoLayout } from "@/lib/db/bento-layout";
import { layoutWriteSchema } from "@/lib/bento-defaults";

const requestSchema = z.object({
  positions: layoutWriteSchema.strict(),
});
```

Leave GET unchanged — it still delegates to `getBentoLayout` which now returns boxes (with `w/h` `optional` after parse; missing keys fall through as `undefined` and the client hydrates against defaults via `mergeLayout`).

- [ ] **Step 8: Update `src/tests/unit/bento-layout-api.test.ts`**

PUT bodies now require `w/h`. Update the two PUT happy-path payloads and the corresponding assertions:

Replace the "PUT with a session and valid positions returns 200 and persists" case:

```ts
it("PUT with a session and valid positions returns 200 and persists", async () => {
  authMock.mockResolvedValue({ user: { id: "u1" } });
  set.mockResolvedValue({ about: { x: 10, y: 20, w: 240, h: 230 } });
  const res = await PUT(
    jsonRequest({ positions: { about: { x: 10, y: 20, w: 240, h: 230 } } }),
  );
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({
    positions: { about: { x: 10, y: 20, w: 240, h: 230 } },
  });
  expect(set).toHaveBeenCalledWith({ about: { x: 10, y: 20, w: 240, h: 230 } });
});
```

The "PUT with a session but invalid positions returns 400" case still works as-is (`{ unknown: {...} }` is still invalid). Leave it.

Add a new case for the new validation behavior — missing `w/h` is rejected by write schema:

```ts
it("PUT rejects body without w/h on a card box", async () => {
  authMock.mockResolvedValue({ user: { id: "u1" } });
  const res = await PUT(jsonRequest({ positions: { about: { x: 10, y: 20 } } }));
  expect(res.status).toBe(400);
  expect(set).not.toHaveBeenCalled();
});
```

The GET test mocks `getBentoLayout` returning `{ about: { x: 1, y: 2 } }`. The API just passes the value through, so the assertion stays as-is.

- [ ] **Step 9: Update `src/tests/unit/bento-layout-db.test.ts`**

The db layer parses with the read schema. Since `w/h` are now optional on read, legacy `{x, y}` blobs parse cleanly and the db function returns them as-is (the `w/h` are simply absent). The existing tests already use legacy shape — they still pass without changes. Verify by running.

Add one new test for forward-compat — a row with full `{x, y, w, h}`:

```ts
it("getBentoLayout returns the full box when w/h are saved", async () => {
  findUnique.mockResolvedValue({
    id: "default",
    positions: { about: { x: 1, y: 2, w: 200, h: 200 } },
    updatedAt: new Date(),
  });
  expect(await getBentoLayout()).toEqual({
    about: { x: 1, y: 2, w: 200, h: 200 },
  });
});
```

- [ ] **Step 10: Update `src/tests/unit/edit-toolbar.test.tsx`**

`TEST_LAYOUT` and the admin save mock response need `w/h`. Replace `TEST_LAYOUT`:

```ts
const TEST_LAYOUT = {
  about: { x: 30, y: 130, w: 240, h: 230 },
  calendar: { x: 350, y: 130, w: 160, h: 175 },
  music: { x: 340, y: 440, w: 260, h: 56 },
  photos: { x: 605, y: 130, w: 250, h: 245 },
  blog: { x: 30, y: 390, w: 290, h: 170 },
  hanabi: { x: 350, y: 532, w: 220, h: 65 },
  "clock-lcd": { x: 350, y: 330, w: 200, h: 80 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120 },
  likes: { x: 790, y: 440, w: 80, h: 85 },
} as const;
```

Update the admin save mocked response:

```ts
fetchMock.mockResolvedValue(
  new Response(
    JSON.stringify({ positions: { about: { x: 1, y: 2, w: 240, h: 230 } } }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  ),
);
```

And update the corresponding assertion:

```ts
await waitFor(() =>
  expect(onServerAccepted).toHaveBeenCalledWith({
    about: { x: 1, y: 2, w: 240, h: 230 },
  }),
);
```

- [ ] **Step 11: Verify `src/tests/unit/editable-bento.test.tsx` and `src/tests/unit/card-frame.test.tsx`**

`editable-bento.test.tsx` passes `initialLayout={{ about: { x: 99, y: 99 } }}` — under the new read shape this is accepted (`w/h` optional). The Spy reads `ctx?.layout.about.x` — still valid because `mergeLayout` hydrates `w/h` from defaults but `x` is unchanged. No code change needed; run to confirm.

`card-frame.test.tsx` asserts default position/size against the `BENTO_DEFAULTS.about` values. No code change needed.

If either file fails after running, fix the symptom inline (most likely a typing tweak) and document the fix in this step's commit.

- [ ] **Step 12: Run typecheck and full test suite**

Run:

```bash
pnpm typecheck
```

Expected: exit code 0.

Then:

```bash
pnpm test
```

Expected: all tests pass (no new tests yet; existing tests pass under the new types).

- [ ] **Step 13: Commit**

```bash
git add src/lib/bento-defaults.ts src/components/home/bento/BentoLayoutContext.ts src/components/home/bento/EditableBento.tsx src/components/home/bento/CardFrame.tsx src/components/home/bento/EditToolbar.tsx src/lib/db/bento-layout.ts src/app/api/bento-layout/route.ts src/tests/unit/bento-layout-api.test.ts src/tests/unit/bento-layout-db.test.ts src/tests/unit/edit-toolbar.test.tsx
git commit -m "refactor(bento): rename Position to CardBox, add minW/minH, split read/write schemas"
```

---

### Task 2: TDD `clampAndScaleResize` pure function

This is the math core of the resize feature. Pure function, no DOM, no React. Full TDD discipline.

**Files:**
- Create: `src/components/home/bento/card-frame-resize.ts`
- Test: `src/tests/unit/card-frame-resize.test.ts`

**Interfaces consumed:**
- `CardBox`, `BENTO_REF_W`, `BENTO_REF_H`, `CLAMP_BUFFER` from `@/lib/bento-defaults`

**Interfaces produced:**
- `type Corner = "tl" | "tr" | "bl" | "br"`
- `clampAndScaleResize(prev: CardBox, corner: Corner, pixelOffset: { x: number; y: number }, ctx: { renderedWidth: number; minW: number; minH: number }): CardBox`

- [ ] **Step 1: Write the first failing test (br corner happy path)**

Create `src/tests/unit/card-frame-resize.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm test src/tests/unit/card-frame-resize.test.ts
```

Expected: fails with module-not-found or function-not-defined.

- [ ] **Step 3: Implement the minimal `clampAndScaleResize`**

Create `src/components/home/bento/card-frame-resize.ts`:

```ts
import { BENTO_REF_W, BENTO_REF_H, CLAMP_BUFFER, type CardBox } from "@/lib/bento-defaults";

export type Corner = "tl" | "tr" | "bl" | "br";

export function clampAndScaleResize(
  prev: CardBox,
  corner: Corner,
  pixelOffset: { x: number; y: number },
  ctx: { renderedWidth: number; minW: number; minH: number },
): CardBox {
  // Same width-ratio scaling trick as clampAndScale: the bento aspect
  // is locked, so width ratio converts both axes from rendered px to
  // ref px.
  const scale = BENTO_REF_W / Math.max(ctx.renderedWidth, 1);
  const dx = Math.round(pixelOffset.x * scale);
  const dy = Math.round(pixelOffset.y * scale);

  // Per-corner delta: which fields change and in which direction.
  let nextX = prev.x;
  let nextY = prev.y;
  let nextW = prev.w;
  let nextH = prev.h;

  switch (corner) {
    case "br":
      nextW = prev.w + dx;
      nextH = prev.h + dy;
      break;
    case "bl":
      nextX = prev.x + dx;
      nextW = prev.w - dx;
      nextH = prev.h + dy;
      break;
    case "tr":
      nextY = prev.y + dy;
      nextW = prev.w + dx;
      nextH = prev.h - dy;
      break;
    case "tl":
      nextX = prev.x + dx;
      nextY = prev.y + dy;
      nextW = prev.w - dx;
      nextH = prev.h - dy;
      break;
  }

  // Enforce minW: if the box would go below minW, clamp and re-anchor
  // x so the opposite (right) edge stays put. Only matters when we are
  // pulling x inward (tl / bl).
  if (nextW < ctx.minW) {
    if (corner === "tl" || corner === "bl") {
      // Right edge of previous = prev.x + prev.w. We want
      // nextX + minW = prev.x + prev.w  ⇒  nextX = prev.x + prev.w - minW.
      nextX = prev.x + prev.w - ctx.minW;
    }
    nextW = ctx.minW;
  }
  if (nextH < ctx.minH) {
    if (corner === "tl" || corner === "tr") {
      nextY = prev.y + prev.h - ctx.minH;
    }
    nextH = ctx.minH;
  }

  // Canvas-edge clamp with CLAMP_BUFFER overflow allowance.
  const maxW = BENTO_REF_W + 2 * CLAMP_BUFFER;
  const maxH = BENTO_REF_H + 2 * CLAMP_BUFFER;
  nextW = Math.min(nextW, maxW);
  nextH = Math.min(nextH, maxH);

  const minX = -CLAMP_BUFFER;
  const maxX = BENTO_REF_W - nextW + CLAMP_BUFFER;
  const minY = -CLAMP_BUFFER;
  const maxY = BENTO_REF_H - nextH + CLAMP_BUFFER;
  nextX = Math.max(minX, Math.min(maxX, nextX));
  nextY = Math.max(minY, Math.min(maxY, nextY));

  return { x: nextX, y: nextY, w: nextW, h: nextH };
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
pnpm test src/tests/unit/card-frame-resize.test.ts
```

Expected: PASS for the `br` case.

- [ ] **Step 5: Add the remaining happy-path corner tests**

Append to `src/tests/unit/card-frame-resize.test.ts`:

```ts
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
```

- [ ] **Step 6: Run all 4 happy-path tests**

```bash
pnpm test src/tests/unit/card-frame-resize.test.ts
```

Expected: 4 PASS.

- [ ] **Step 7: Add minW/minH touchdown tests**

Append:

```ts
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
```

- [ ] **Step 8: Add canvas-edge clamp test**

Append:

```ts
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
```

- [ ] **Step 9: Add integer-rounding and zero-offset tests**

Append:

```ts
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
```

- [ ] **Step 10: Run the full resize test file**

```bash
pnpm test src/tests/unit/card-frame-resize.test.ts
```

Expected: 8 tests PASS.

- [ ] **Step 11: Commit**

```bash
git add src/components/home/bento/card-frame-resize.ts src/tests/unit/card-frame-resize.test.ts
git commit -m "feat(bento): add clampAndScaleResize pure function with per-corner deltas and min/max clamping"
```

---

### Task 3: `ResizeHandles` component

A standalone component that renders 4 corner handles. Each handle fires `onResize` per frame and `onCommit` on release. No CardFrame integration yet — that's Task 4.

**Files:**
- Create: `src/components/home/bento/card-frame-resize-handles.tsx`
- Test: `src/tests/unit/card-frame-resize-handles.test.tsx`

**Interfaces consumed:**
- `Corner` from `@/components/home/bento/card-frame-resize`
- framer-motion `motion`, `PanInfo`

**Interfaces produced:**
- `ResizeHandles({ onResize, onCommit }: Props)` where:
  - `onResize: (corner: Corner, pixelOffset: { x: number; y: number }) => void`
  - `onCommit: (corner: Corner, pixelOffset: { x: number; y: number }) => void`

- [ ] **Step 1: Write the failing test**

Create `src/tests/unit/card-frame-resize-handles.test.tsx`:

```tsx
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
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test src/tests/unit/card-frame-resize-handles.test.tsx
```

Expected: fails (module not found).

- [ ] **Step 3: Implement the component**

Create `src/components/home/bento/card-frame-resize-handles.tsx`:

```tsx
"use client";

import { motion, type PanInfo } from "framer-motion";
import type { Corner } from "./card-frame-resize";

type Props = {
  onResize: (corner: Corner, pixelOffset: { x: number; y: number }) => void;
  onCommit: (corner: Corner, pixelOffset: { x: number; y: number }) => void;
};

const CORNER_POSITION: Record<Corner, string> = {
  tl: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  tr: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  bl: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  br: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
};

const CORNERS: Corner[] = ["tl", "tr", "bl", "br"];

export function ResizeHandles({ onResize, onCommit }: Props) {
  return (
    <>
      {CORNERS.map((corner) => (
        <motion.div
          key={corner}
          data-resize-handle={corner}
          className={[
            "absolute z-10 h-3 w-3 rounded-sm bg-cinnabar/60",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
            // Hit area enlarged via a pseudo-element so the visual stays small.
            "before:absolute before:inset-[-4px] before:content-['']",
            CORNER_POSITION[corner],
          ].join(" ")}
          onPointerDown={(e) => e.stopPropagation()}
          onPan={(_, info: PanInfo) => onResize(corner, info.offset)}
          onPanEnd={(_, info: PanInfo) => onCommit(corner, info.offset)}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
pnpm test src/tests/unit/card-frame-resize-handles.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Add an interaction test for stopPropagation and callback wiring**

Append to `card-frame-resize-handles.test.tsx`:

```tsx
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
```

- [ ] **Step 6: Run the suite**

```bash
pnpm test src/tests/unit/card-frame-resize-handles.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/bento/card-frame-resize-handles.tsx src/tests/unit/card-frame-resize-handles.test.tsx
git commit -m "feat(bento): add ResizeHandles component with 4 corner handles and pointer isolation"
```

---

### Task 4: Wire resize into `CardFrame`

Mount `ResizeHandles` inside the existing `motion.div`, add `sizeDW`/`sizeDH` motion values, bind width/height via `useTransform`, and commit the new box on release.

**Files:**
- Modify: `src/components/home/bento/CardFrame.tsx`
- Modify: `src/tests/unit/card-frame.test.tsx` (extend the framer-motion mock for `useTransform`)

**Interfaces consumed:**
- `clampAndScaleResize`, `Corner` from `./card-frame-resize`
- `ResizeHandles` from `./card-frame-resize-handles`

**Interfaces produced:**
- None new (CardFrame still exports `CardFrame`); behavior in edit mode now supports resize.

- [ ] **Step 1: Update the framer-motion test mock to include `useTransform`**

Replace the `vi.mock("framer-motion", ...)` block in `src/tests/unit/card-frame.test.tsx`:

```tsx
vi.mock("framer-motion", () => ({
  motion: { div: (props: React.ComponentProps<"div">) => <div {...props} /> },
  useReducedMotion: () => mockUseReducedMotion(),
  useMotionValue: (initial: number) => ({ get: () => initial, set: () => {} }),
  // useTransform returns a motion value; for the reduced-motion path the
  // CardFrame branch we are testing never reads it. Return a noop motion value.
  useTransform: () => ({ get: () => 0, set: () => {} }),
}));
```

- [ ] **Step 2: Run the existing card-frame test to confirm baseline is green**

```bash
pnpm test src/tests/unit/card-frame.test.tsx
```

Expected: PASS (unchanged behavior since the test exercises the reduced-motion branch).

- [ ] **Step 3: Update `src/components/home/bento/CardFrame.tsx` — imports**

Add new imports at the top:

```ts
import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/cn";
import {
  BENTO_DEFAULTS,
  BENTO_REF_W,
  BENTO_REF_H,
  type CardId,
} from "@/lib/bento-defaults";
import { useBentoLayout } from "./BentoLayoutContext";
import { clampAndScale } from "./card-frame-drag";
import { clampAndScaleResize, type Corner } from "./card-frame-resize";
import { ResizeHandles } from "./card-frame-resize-handles";
```

- [ ] **Step 4: Add resize motion values and useTransform width/height bindings**

In the component body, just after the existing `dragX` / `dragY` lines, add:

```ts
const sizeDW = useMotionValue(0);
const sizeDH = useMotionValue(0);

// useTransform returns a motion value derived from one or more inputs.
// Each frame, framer-motion writes the computed CSS string to the DOM
// without triggering a React re-render.
const widthCalc = useTransform(
  sizeDW,
  (dw: number) => `calc(${(pos.w / BENTO_REF_W) * 100}% + ${dw}px)`,
);
const heightCalc = useTransform(
  sizeDH,
  (dh: number) => `calc(${(pos.h / BENTO_REF_H) * 100}% + ${dh}px)`,
);
```

- [ ] **Step 5: Extend the useLayoutEffect reset to cover size motion values**

Replace the existing `useLayoutEffect` that resets `dragX`/`dragY`:

```ts
useLayoutEffect(() => {
  dragX.set(0);
  dragY.set(0);
  sizeDW.set(0);
  sizeDH.set(0);
}, [pos.x, pos.y, pos.w, pos.h, dragX, dragY, sizeDW, sizeDH]);
```

- [ ] **Step 6: Replace `responsiveStyle` width/height with the transformed motion values**

The static `responsiveStyle` no longer holds width/height (they go on `style` via the motion values):

```ts
const responsiveStyle: React.CSSProperties = {
  left: `${(pos.x / BENTO_REF_W) * 100}%`,
  top: `${(pos.y / BENTO_REF_H) * 100}%`,
};
```

And update the reduced-motion branch's `<div>` style to use static width/height (no motion values in that branch):

```tsx
if (reduced) {
  return (
    <div
      ref={ref}
      className={cn("md:absolute", className)}
      style={{
        ...responsiveStyle,
        width: `${(pos.w / BENTO_REF_W) * 100}%`,
        height: `${(pos.h / BENTO_REF_H) * 100}%`,
        ...sharpenStyle,
        ...(rotated ? { transform: `rotate(${finalRotation}deg)` } : {}),
      }}
    >
      <div className="h-full w-full" style={counterStyle}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Bind motion-value width/height onto the active `motion.div`**

Update the `style` prop on the main `motion.div`:

```tsx
style={{
  ...responsiveStyle,
  ...sharpenStyle,
  width: widthCalc,
  height: heightCalc,
  x: dragX,
  y: dragY,
}}
```

- [ ] **Step 8: Add `group` class on the `motion.div` so handles can use `group-hover`**

Update the `className` prop:

```tsx
className={cn(
  "md:absolute will-change-transform group",
  editing ? "cursor-grab outline outline-1 outline-dashed outline-cinnabar/50" : "",
  className,
)}
```

- [ ] **Step 9: Add resize commit/realtime handlers**

Inside the component body, add the two handlers:

```ts
function handleResize(corner: Corner, offset: { x: number; y: number }) {
  if (!ctx) return;
  const parent = ref.current?.parentElement;
  const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
  const next = clampAndScaleResize(pos, corner, offset, {
    renderedWidth,
    minW: defaults.minW,
    minH: defaults.minH,
  });
  // Realtime delta in ref-px. Motion values get the offset relative to
  // the committed pos so the visual is `pos + delta` every frame.
  dragX.set(next.x - pos.x);
  dragY.set(next.y - pos.y);
  sizeDW.set(((next.w - pos.w) / BENTO_REF_W) * (parent?.getBoundingClientRect().width ?? 0));
  sizeDH.set(((next.h - pos.h) / BENTO_REF_H) * (parent?.getBoundingClientRect().height ?? 0));
}

function handleResizeCommit(corner: Corner, offset: { x: number; y: number }) {
  if (!ctx) return;
  const parent = ref.current?.parentElement;
  const renderedWidth = parent?.getBoundingClientRect().width ?? BENTO_REF_W;
  const next = clampAndScaleResize(pos, corner, offset, {
    renderedWidth,
    minW: defaults.minW,
    minH: defaults.minH,
  });
  ctx.setCardBox(cardId, next);
}
```

(Explanation: `sizeDW`/`sizeDH` are in **rendered px** because `widthCalc` does `... + ${dw}px`. So we convert ref-px delta back to rendered-px for the motion value. On commit, `pos.w/h` updates and the layout effect resets the motion values to 0 in the same paint frame.)

- [ ] **Step 10: Mount `ResizeHandles` inside the main `motion.div`**

After the `<div counterStyle>...</div>` child block inside the main `motion.div`, add the handles:

```tsx
{editing && (
  <ResizeHandles onResize={handleResize} onCommit={handleResizeCommit} />
)}
```

- [ ] **Step 11: Run the card-frame test to confirm the reduced-motion path still renders correctly**

```bash
pnpm test src/tests/unit/card-frame.test.tsx
```

Expected: PASS. The mocked `useTransform` returns a noop motion value; the reduced-motion branch doesn't use it.

- [ ] **Step 12: Run typecheck and full suite**

```bash
pnpm typecheck
pnpm test
```

Expected: both green.

- [ ] **Step 13: Smoke-test manually in the browser**

```bash
pnpm dev
```

Then in the browser:
- Visit `/` at a desktop viewport (≥ 880 px wide).
- Click the edit pencil to enter edit mode.
- Hover any card — 4 small `cinnabar` squares should fade in at the corners.
- Drag the bottom-right square — card grows, top-left corner stays put.
- Drag the top-left square — card shrinks, bottom-right stays put.
- Release — card settles at the new size, no jitter, no snap-back.
- Click `discard` — card returns to its starting size.

If anything visibly jitters or snaps back, investigate before commit (the most likely culprit is the layout effect deps; check `pos.w`/`pos.h` are listed).

- [ ] **Step 14: Commit**

```bash
git add src/components/home/bento/CardFrame.tsx src/tests/unit/card-frame.test.tsx
git commit -m "feat(bento): wire ResizeHandles into CardFrame with motion-value width/height"
```

---

### Task 5: Drag jitter fix — disable `whileHover` in edit mode

The `whileHover` animation writes `y: -3`, which fights `dragY` during pointer-down → release. Disable hover lift entirely when `editing` is true.

**Files:**
- Modify: `src/components/home/bento/CardFrame.tsx`

- [ ] **Step 1: Locate the `whileHover` prop on the main `motion.div`**

Current line (around line 107-109):

```tsx
whileHover={editing ? undefined : hoverScale
  ? { scale: hoverScale, transition: { duration: 0.2 } }
  : { y: -3, transition: { duration: 0.2 } }}
```

The condition is already `editing ? undefined : ...`, so reads of the code say jitter shouldn't happen. Verify by re-reading the file: if the existing gate is intact, this step is a no-op and proceed to Step 2. If the gate has drifted (e.g. `whileHover` was simplified during a refactor), restore it to the form above.

- [ ] **Step 2: Belt-and-suspenders — also gate `whileDrag`'s filter to avoid layout-affecting effects**

`whileDrag` writes `filter: drop-shadow(...)`. This is GPU-only and shouldn't cause jitter, but to be safe confirm it's the only property set:

```tsx
whileDrag={{ cursor: "grabbing", filter: "drop-shadow(0 8px 16px rgba(36,30,23,0.18))" }}
```

If extra properties were added since the spec was written (e.g. `scale`, `y`), strip them — they can fight resize motion values. Otherwise no change.

- [ ] **Step 3: Manual jitter smoke-test in the browser**

```bash
pnpm dev
```

In edit mode:
- Hover a card without dragging → should NOT lift by 3px (no `whileHover` in editing). Confirm.
- Press and hold a card → it should pick up the drop-shadow only; no other transform changes.
- Release without moving → no visible position change.
- Repeatedly press and release in fast succession → no jitter, no flicker.

- [ ] **Step 4: Commit (only if any code actually changed)**

If Steps 1-2 produced no diff, skip the commit and proceed to Task 6. Otherwise:

```bash
git add src/components/home/bento/CardFrame.tsx
git commit -m "fix(bento): tighten edit-mode hover/drag gates to prevent jitter"
```

---

### Task 6: Final verification and persistence smoke test

End-to-end check that resize persists through the existing Save flow.

**Files:**
- None modified; this is a verification + final commit guard.

- [ ] **Step 1: Run the full test suite and typecheck**

```bash
pnpm typecheck
pnpm test
```

Expected: both green. If anything is red, fix inline (most likely a missed type rename from Task 1).

- [ ] **Step 2: Run the manual verification checklist from the spec (§8.3)**

Start dev server: `pnpm dev`. As **non-admin** (logged out), in edit mode at a desktop viewport:

1. Hover each card → 4 handles fade in.
2. Leave hover → handles fade out.
3. Drag `about`'s `br` handle outward → card grows; top-left stays put.
4. Drag `about`'s `tl` handle inward → card shrinks; bottom-right stays put.
5. Shrink to `minW=160` and keep pulling — card stays at `minW`, no jitter.
6. Shrink to `minH=160` — same as #5.
7. Grow `about` rightward past the canvas — clamps so `x + w ≤ 880 + 120`.
8. Pointer-down on a handle does NOT drag the card.
9. Resize `about` → click `save` → exit edit mode. Re-enter edit mode → size persists.
10. Resize `about` → click `discard` → card snaps back to starting size.
11. Reload (still non-admin) → defaults restored (non-admin saves are tab-only).

Then sign in as **admin** and:

12. Repeat #3-4 quickly to confirm same behavior under admin.
13. Resize `about`, click `save`, watch network: a `PUT /api/bento-layout` fires with full `{x, y, w, h}` for every card.
14. Reload → the admin-saved size is restored.

Also:

15. Resize at viewport widths 880 / 1100 / 1300 px → relative position/size scales proportionally; min sizes don't appear tiny at smaller viewports because they're in ref-px.
16. Open at viewport `< md` → no handles, cards in flex stack, no edit pencil.
17. With OS `prefers-reduced-motion: reduce` → no handles render; reduced-motion branch shows static box with defaults+saved size applied.

If any item fails, investigate the failure mode, fix in code, re-run.

- [ ] **Step 3: Old-blob compatibility smoke-test**

Manually verify (or skip if no production data on dev DB): a row whose `positions` JSON contains only `{x, y}` per card (the pre-resize shape) loads cleanly:
- The page renders with default `w/h` for every card.
- No console errors.
- Entering edit mode and saving as admin rewrites the row with full `{x, y, w, h}`.

- [ ] **Step 4: Final commit (verification artifact only — optional)**

If any minor fixes were needed during verification, commit them now. Otherwise no commit.

```bash
git status   # confirm clean tree
```

If clean, the feature is complete. Otherwise:

```bash
git add -p   # review each change before staging
git commit -m "fix(bento): <specific fix uncovered during verification>"
```

---

## Self-Review Notes

This plan implements the spec in 6 tasks:

- **Task 1** is the largest — a mechanical migration that lands the type rename + schema split atomically so subsequent tasks build on a clean base. It explicitly does NOT change runtime behavior.
- **Task 2** TDD's the pure math (the part of the system most worth unit-testing). 8 tests across happy paths, min clamps, edge clamps, and integer rounding.
- **Task 3** ships `ResizeHandles` as a standalone component with its own tests (render + pointer isolation).
- **Task 4** integrates handles into `CardFrame` with the motion-value pattern that mirrors the existing drag flow.
- **Task 5** addresses the latent drag jitter (mostly verification — the gate may already be correct in the current code).
- **Task 6** is end-to-end manual verification covering all the spec's checklist items including admin-gated persistence and old-blob back-compat.

Spec sections mapped to tasks:
- §3 (Data model) → Task 1
- §4 (Architecture) → Tasks 3, 4
- §5 (Computation) → Task 2 (math) + Task 4 (style binding)
- §6 (Persistence) → Task 1
- §7 (Jitter fixes) → Task 5
- §8 (Testing) → Tasks 2, 3, 4 (unit tests) + Task 6 (manual checklist)
- §9 (Files touched) → covered across Tasks 1-4
- §10 (Risks) → addressed in step-level notes (e.g. useTransform returning a string; old blob back-compat in Task 6 Step 3)

No placeholders, no "similar to above" handwaving, no forward references to undefined functions.
