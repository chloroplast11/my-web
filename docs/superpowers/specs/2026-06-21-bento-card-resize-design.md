# Bento Card Resize via Corner Handles

**Date:** 2026-06-21
**Scope:** Add 4-corner resize handles to bento cards in edit mode, persist width/height alongside x/y, and fix latent drag jitter while we're in the file.
**Out of scope:** Mobile resize, rotation editing, aspect-ratio lock, collision/snap-to-grid, undo/redo, per-card overlap prevention.

---

## 1. Goal

In edit mode, hovering a card reveals 4 corner handles. Dragging any handle resizes the card by moving that corner; the opposite corner stays fixed. Resize is realtime (tracks the pointer per frame), commits on pointer-up, persists through the existing **Save** / **Save with key** flow, and survives page refresh exactly like position does today.

## 2. Behavior model

| Action | Storage | Visibility |
|---|---|---|
| Hover a card in edit mode | — | 4 corner handles fade in |
| Drag a corner handle | React state (motion values) | This tab — realtime tracking |
| Release | Commit `{x, y, w, h}` to context | This tab |
| `Save` / `Save with key` | Same path as drag (see `EditableBento` + `EditToolbar`) | Tab-only or server-wide |
| `Discard` | Resets to `serverLayout` | Drops in-progress size changes |
| Viewports `< md` | Disabled (handles do not render) | Same gate as drag |
| `useReducedMotion()` | Disabled (handles do not render) | Same gate as drag |

All cards are resizable. Each card declares its own `minW` / `minH`; below those the corner stops moving inward. The bento canvas edges still apply `CLAMP_BUFFER` (currently 120 ref-px) as a soft outer bound.

## 3. Data model

### 3.1 Type rename and extension

`Position` → `CardBox` (semantic accuracy; current "Position" already gets stretched to mean "the saved per-card state"). The wire-level field name (`positions` in the JSON column and API payload) stays the same to keep old saved blobs readable; only the inner shape grows.

```ts
// src/lib/bento-defaults.ts
export type CardBox = { x: number; y: number; w: number; h: number };
export type Layout = Partial<Record<CardId, CardBox>>;
```

### 3.2 `BENTO_DEFAULTS` gains `minW` / `minH`

```ts
export type CardDefaults = {
  x: number; y: number;
  w: number; h: number;
  minW: number; minH: number;
};
```

Each card's `minW` / `minH` is filled per content needs (e.g. `clock-lcd` and `music` are already short — their `minW` should be close to current `w`; `about` and `blog` can shrink further). Implementation step picks the actual values after eyeballing each card; design constraint: `minW ≥ 40` and `minH ≥ 40` globally as a sanity floor.

### 3.3 Read-side fallback (back-compat with old saved data)

Old saved blobs contain `{x, y}` only. Use **two schemas** to keep the write boundary strict while the read path forgives:

- `cardBoxReadSchema` — `{x, y, w?, h?}`. Used by `getBentoLayout`. After parse, a hydration step fills missing `w`/`h` from `BENTO_DEFAULTS[id]`.
- `cardBoxWriteSchema` — `{x, y, w, h}` all required. Used by `PUT /api/bento-layout`.

`layoutSchema` and `layoutWriteSchema` reference the corresponding per-entry schema.

### 3.4 Zod schema updates

```ts
const xyBase = {
  x: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_W + CLAMP_BUFFER),
  y: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_H + CLAMP_BUFFER),
};
const whWrite = {
  w: z.number().int().min(40).max(BENTO_REF_W + 2 * CLAMP_BUFFER),
  h: z.number().int().min(40).max(BENTO_REF_H + 2 * CLAMP_BUFFER),
};

export const cardBoxWriteSchema = z.object({ ...xyBase, ...whWrite });
export const cardBoxReadSchema = z.object({
  ...xyBase,
  w: whWrite.w.optional(),
  h: whWrite.h.optional(),
});
```

`positionSchema` is removed; consumers switch to the appropriate read/write schema. `layoutSchema` becomes two: `layoutReadSchema` (per-entry optional w/h) and `layoutWriteSchema` (per-entry required). No DB migration — the `positions` column on `bentoLayout` is already a JSON blob.

## 4. Architecture

### 4.1 `CardFrame.tsx` rendering layout

```
<motion.div drag={editing}>                 ← outer: drag + width/height motion values
  <div counterStyle>                        ← inner: content wrapper (counter-rotation if any)
    {children}
  </div>
  {editing && !reduced && <ResizeHandles ... />}  ← NEW: 4 corner handles
</motion.div>
```

Handles are siblings of the content wrapper (not nested inside it) so the existing `[&_*]:pointer-events-none` rule on the wrapper does not affect them.

The outer `motion.div` gains a `group` class so handles can use `opacity-0 group-hover:opacity-100`.

### 4.2 New module: `card-frame-resize-handles.tsx`

```tsx
type Corner = "tl" | "tr" | "bl" | "br";

function ResizeHandles({
  rendered,         // { width: number } from parent's bounding rect, for scale conversion
  onResize,         // (corner, pixelOffset) => void — called every onPan frame
  onCommit,         // (corner, pixelOffset) => void — called on onPanEnd
}: Props): JSX.Element
```

Renders 4 `motion.div`s absolutely positioned at the 4 corners. Each:
- Visual: 12×12 px square, `bg-cinnabar/60`, rounded `1px`, centered on its corner (`-translate-x-1/2 -translate-y-1/2`).
- Hit area: a `::before` pseudo-element of 20×20 around the visual square.
- Cursor: `cursor-nwse-resize` for `tl`/`br`, `cursor-nesw-resize` for `tr`/`bl`.
- `opacity-0 group-hover:opacity-100 transition-opacity duration-150`.
- `onPointerDown={(e) => e.stopPropagation()}` to keep the parent drag from firing.
- `onPan(_, info) → onResize(corner, info.offset)`.
- `onPanEnd(_, info) → onCommit(corner, info.offset)`.

### 4.3 `CardFrame` state additions

Two new motion values mirror the existing `dragX` / `dragY` pattern:

```ts
const sizeDW = useMotionValue(0);
const sizeDH = useMotionValue(0);
```

`useLayoutEffect` resets all four (dragX/Y, sizeDW/DH) when `pos.x/y/w/h` change. This is the same trick the drag flow already uses: the CSS percentage moves to the new box in the same paint frame the motion values reset, preventing a visual snap-back.

### 4.4 `BentoLayoutContext` update

`setCardPosition(id, Position)` is renamed `setCardBox(id, CardBox)`. Drag and resize both call it — drag passes `{...prev, x, y}`, resize passes `{...prev, x, y, w, h}`. The rename is mechanical (one setter, one consumer, type signature widens).

## 5. Computation

### 5.1 Per-corner delta

`info.offset` from framer-motion is the screen-pixel pointer delta since pointer-down. After scaling back to bento-ref pixels (same `scale = BENTO_REF_W / renderedWidth` trick as `clampAndScale`), each corner maps as:

| Corner | Δx | Δy | Δw | Δh |
|---|---|---|---|---|
| `br` | 0 | 0 | +dx | +dy |
| `bl` | +dx | 0 | −dx | +dy |
| `tr` | 0 | +dy | +dx | −dy |
| `tl` | +dx | +dy | −dx | −dy |

(No rotation correction needed — all `finalRotation` values are 0 in current usage; revisit if non-zero rotation is reintroduced.)

### 5.2 New module: `card-frame-resize.ts`

```ts
export function clampAndScaleResize(
  prev: CardBox,
  corner: Corner,
  pixelOffset: { x: number; y: number },
  ctx: { renderedWidth: number; minW: number; minH: number },
): CardBox
```

Steps:
1. `scale = BENTO_REF_W / max(renderedWidth, 1)`, then `dx = round(pixelOffset.x * scale)`, `dy = round(pixelOffset.y * scale)`.
2. Apply the per-corner delta table to compute `nextX, nextY, nextW, nextH`.
3. Enforce `minW` / `minH`: if `nextW < minW`, clamp `nextW = minW` and **also** re-anchor `nextX` so the opposite corner stays fixed (for `tl` and `bl` the x had been moving; once w hits min it must stop). Same for `nextH` / `nextY`.
4. Enforce canvas bounds with `CLAMP_BUFFER`:
   - `nextX ∈ [−BUFFER, BENTO_REF_W − nextW + BUFFER]`
   - `nextY ∈ [−BUFFER, BENTO_REF_H − nextH + BUFFER]`
   - `nextW ∈ [minW, BENTO_REF_W + 2·BUFFER]`
   - `nextH ∈ [minH, BENTO_REF_H + 2·BUFFER]`
5. Return all four as integers.

The existing `card-frame-drag.ts → clampAndScale` is left untouched (drag's hot path is simpler and well-tested; resize gets its own function).

### 5.3 Realtime style binding

`CardFrame` builds `style` so the motion values drive width/height as a CSS calc relative to the percentage base:

```ts
style={{
  left: `${(pos.x / BENTO_REF_W) * 100}%`,
  top: `${(pos.y / BENTO_REF_H) * 100}%`,
  width: useTransform(sizeDW, (dw) => `calc(${(pos.w / BENTO_REF_W) * 100}% + ${dw}px)`),
  height: useTransform(sizeDH, (dh) => `calc(${(pos.h / BENTO_REF_H) * 100}% + ${dh}px)`),
  x: dragX,
  y: dragY,
}}
```

(`useTransform` is framer-motion's way to derive a motion value from another; React doesn't re-render — only the style attribute updates.)

Note: when resizing from `tl` / `bl`, the corner's x movement is fed into `dragX` simultaneously with the width delta into `sizeDW`. On commit, both `pos.x` and `pos.w` change; `useLayoutEffect` resets both motion values to 0 in the same paint frame.

## 6. Persistence

### 6.1 `EditableBento`

- `mergeLayout` fills both `{x, y}` and `{w, h}` from `BENTO_DEFAULTS` when a card id is missing or partially saved.
- `setCardBox` replaces `setCardPosition`. Internal `setLayout` call is unchanged in shape.
- `discard` and `acceptServerLayout` already do full-object replacement; no change.

### 6.2 API route `src/app/api/bento-layout/route.ts`

- Reads via `cardBoxReadSchema` (w/h optional) and hydrates from defaults before responding.
- PUT body still wrapped as `{ positions: Layout }`. `cardBoxWriteSchema` validates required `{x, y, w, h}` for every entry.
- The wire field stays named `positions` (not `boxes`); this avoids a wire-level break for old clients/blobs.

### 6.3 DB layer `src/lib/db/bento-layout.ts`

- `getBentoLayout` parses with the loose / read schema; the prisma JSON column tolerates additional keys.
- `setBentoLayout` writes the full `{x, y, w, h}` shape; old rows are overwritten on the next save.

No prisma migration required.

## 7. Drag jitter fixes (bundled)

Latent issues in the current drag flow surface more often during resize, so fix them in the same PR:

1. **`whileHover: y: -3` vs `dragY` contention** — [CardFrame.tsx:107-109](src/components/home/bento/CardFrame.tsx#L107-L109). The hover spring writes the same motion property the drag uses. Disable `whileHover` entirely when `editing` is true. (Already partially gated; verify and tighten.)
2. **`whileDrag` filter on rotate** — `whileDrag` applies `filter: drop-shadow(...)`. Keep, but verify no transition target on `transform` so it doesn't fight `dragX/Y`.
3. **Position via `left/top` percentage vs `transform`** — optional follow-up. Today the position commit touches CSS `left`/`top` (layout-triggering). Could be converted to `transform: translate()` for full GPU-layer movement. Defer to a separate pass if jitter persists after #1.

## 8. Testing

### 8.1 Unit tests (vitest) — `src/tests/unit/card-frame-resize.test.ts` (new)

Targets `clampAndScaleResize`. Pure function, no React.

- **Per-corner happy path** (4 cases): a fixed `prev` box + a non-zero `pixelOffset` produces the expected `{x, y, w, h}` for each of `tl, tr, bl, br`.
- **minW touchdown**: drag `tl` far enough that w would go below `minW`. Verify `w === minW` AND `x` re-anchors so the right edge (`x + w`) stays equal to the original right edge.
- **minH touchdown**: same as above for `h` / `y` / bottom edge.
- **Canvas bound clamp**: drag `br` past `BENTO_REF_W + BUFFER`. Verify `w` clamps such that `x + w === BENTO_REF_W + BUFFER`.
- **Integer rounding**: feed a fractional `pixelOffset`; verify all four output fields are integers.
- **Zero offset is identity**: empty drag returns the input box unchanged.

`card-frame-drag.test.ts` (if it exists) untouched — drag math is unchanged.

### 8.2 Existing tests to update

- `src/tests/unit/card-frame.test.tsx` — `Position` references rename to `CardBox`; assertions on rendered `width`/`height` style need to account for the new percentage logic if they pin specific values.
- Any test importing `positionSchema` updates to `cardBoxSchema`.

### 8.3 Manual verification checklist

Run all of these after implementation, in `pnpm dev`:

1. Enter edit mode → hover each card → 4 handles appear at the 4 corners with sensible cursors.
2. Leave hover → handles fade out.
3. Drag right-bottom handle of `about` → card grows toward bottom-right; top-left corner stationary.
4. Drag top-left handle of `about` → card shrinks toward bottom-right; bottom-right corner stationary.
5. Shrink to `minW` and continue pulling — card stays at `minW`, no jitter, no ghost.
6. Shrink to `minH` — same as #5 for height.
7. Grow toward right edge past canvas — clamps at `BENTO_REF_W − w + BUFFER`.
8. Pointer-down on a handle does NOT trigger card drag (parent stays put).
9. Resize, then press `Save` → exit edit mode, card keeps new size. Re-enter edit mode, size persists.
10. Resize, press `Discard` → card snaps back to server's size.
11. Resize, `Save with key`, refresh the page → size restored from server.
12. Open at viewport widths 880 / 1100 / 1300 px → resized cards scale proportionally.
13. Open at viewport `< md` → no handles, cards in flex-stack.
14. With `prefers-reduced-motion: reduce` → no handles, no animation.
15. Load an old saved layout (one without `w`/`h` keys) → reads cleanly, cards use default sizes, no errors in console.
16. Drag (position, not resize) still works the same as before; no new jitter.

### 8.4 No e2e tests

Project has no e2e harness today; not adding one for this change. Coverage is unit tests + manual checklist.

## 9. Files touched

| File | Change |
|---|---|
| `src/lib/bento-defaults.ts` | Rename `Position` → `CardBox`; add `minW` / `minH` to `CardDefaults` and `BENTO_DEFAULTS`; update Zod schemas |
| `src/components/home/bento/CardFrame.tsx` | Add `sizeDW` / `sizeDH` motion values; mount `ResizeHandles` in edit mode; bind width/height via `useTransform`; gate `whileHover` off in edit mode |
| `src/components/home/bento/card-frame-resize-handles.tsx` | NEW — 4-corner handle component |
| `src/components/home/bento/card-frame-resize.ts` | NEW — `clampAndScaleResize` pure function |
| `src/components/home/bento/BentoLayoutContext.ts` | Rename `setCardPosition` → `setCardBox`; type widens |
| `src/components/home/bento/EditableBento.tsx` | Update `mergeLayout` to fill `w/h`; rename setter |
| `src/components/home/bento/EditToolbar.tsx` | Type imports rename (mechanical) |
| `src/app/api/bento-layout/route.ts` | Use new schemas (read tolerates missing w/h, write requires them) |
| `src/lib/db/bento-layout.ts` | Schema rename only; no functional change |
| `src/tests/unit/card-frame-resize.test.ts` | NEW |
| `src/tests/unit/card-frame.test.tsx` | Mechanical rename of types/props |

## 10. Risks and follow-ups

- **`useTransform` returning a string for `style.width`** — confirmed supported by framer-motion v12. If a Tailwind / SSR quirk forces re-evaluation, fall back to writing the CSS variable from a `useMotionValueEvent` subscription.
- **Old saved layouts in production** — the single `bento_layout` row may currently hold a `{x, y}`-only blob. The read-side fallback (§3.3) makes this safe; on the next `Save with key` the blob gets rewritten with `{x, y, w, h}` and old shape is gone.
- **Per-card `minW` / `minH` values** — implementation step picks numbers by eyeballing each card. The design only constrains a global floor (`≥ 40`).
- **Jitter from `left/top` vs `transform`** (§7.3) — deliberately punted. Revisit only if §7.1 doesn't resolve perceived jitter.
- **Mobile resize** — out of scope. The flex-stack layout has no concept of free size, so resize would need a different UX (probably a number stepper, not corner handles). Future spec.
