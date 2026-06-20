# Bento Drag Editor + Key-Gated Save — Round B

**Date:** 2026-06-20
**Scope:** Edit-mode toggle, free-pixel drag of all 8 cards, in-session "save" + server "save with key" persistence, and the auth gate that protects the canonical layout.
**Out of scope:** Mobile editing, card resize/rotation, multi-version history, undo/redo, per-user layouts.

---

## 1. Goal

Anyone can enter edit mode and shuffle the 8 bento cards around the canvas. They can press **Save** to keep their arrangement until the next page refresh, or **Save with key** to push it to the server — the latter overwrites the single canonical layout that every new visitor sees. Without the key, refresh always returns to the canonical layout.

## 2. Behavior model (decided)

| Action | Storage | Visibility |
|---|---|---|
| Drag in edit mode | React state only | This tab only |
| `Discard` | Refetch server layout into state | This tab only |
| `Save` | Keep current state, exit edit mode | This tab only — refresh resets |
| `Save with key` (success) | Server `bento_layout` row overwritten | Every visitor on next page load |
| `Save with key` (wrong key) | Nothing | Stays in edit mode with inline error |
| Page refresh | Fetches server layout | Always shows last successful key-save (or code defaults if never saved) |

No localStorage. No per-visitor persistence. Editing on viewports `< md` is disabled (the edit icon does not render).

## 3. Data model

The layout is a flat map of card-id → `{x, y}` integers in the **bento reference canvas** (`880 × 600`). The CardFrame's existing px-to-percentage math (Round A) renders these consistently at every breakpoint.

```ts
type CardId =
  | "about" | "calendar" | "music" | "photos"
  | "blog"  | "hanabi"   | "clock-lcd" | "clock-analog";

type Position = { x: number; y: number };

type Layout = Partial<Record<CardId, Position>>;
```

Sizes stay locked to Round A's values (no resize). The stored `positions` map is permitted to be sparse — any card id absent from the row falls back to the code defaults in `src/lib/bento-defaults.ts` (new file — see §6.4). On save, the client always sends the full 8-entry map (current positions for every card), so after the first successful key-save the row holds all 8 — but the read path must tolerate sparseness so we don't have to migrate the row when a new card type is added later.

### Server response

`GET /api/bento-layout` →

```json
{ "positions": { "about": { "x": 30, "y": 130 }, ... } }
```

Returns `{ "positions": {} }` when nothing is saved yet. Client merges with code defaults regardless.

## 4. Server endpoints

### `GET /api/bento-layout`

- Public.
- Reads the single `BentoLayout` row (id = `"default"`).
- Returns `{ positions }` (object), never null.
- Cache: `Cache-Control: no-store` (must be fresh on every visit).

### `PUT /api/bento-layout`

- Body: `{ positions: Layout, key: string }`.
- Validates `positions` with `zod` (already in deps): each value `{ x, y }` with `Number.isInteger` and `0 ≤ x ≤ 880`, `0 ≤ y ≤ 600`. Unknown card ids rejected.
- Auth: `crypto.timingSafeEqual` against `process.env.BENTO_LAYOUT_KEY`. Missing env var → 500 with a server log; never accept a missing key as valid.
- Success: upserts the row, returns `200 { positions }`.
- Wrong key: returns `401 { error: "invalid key" }`.
- Malformed body or out-of-range coords: returns `400 { error: "<short reason>" }`.
- Cache: `no-store`.

### Auth implementation

```ts
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
```

Both buffer lengths must match before `timingSafeEqual` is called — otherwise it throws.

## 5. Storage

New Prisma model:

```prisma
model BentoLayout {
  id        String   @id @default("default")
  positions Json
  updatedAt DateTime @updatedAt
}
```

Single-row table. Always read/written with `id: "default"`. Migration added in the implementation plan.

## 6. Client architecture

### 6.1 Page composition (server component, unchanged shape)

`src/app/(site)/page.tsx` fetches the saved layout server-side and passes it into the new client wrapper:

```tsx
const savedLayout = await getBentoLayout(); // server-side Prisma call
return (
  <EditableBento initialLayout={savedLayout}>
    <TitleBlock />
    <PostmarkLayer today={today} />
    <AboutCard enterIndex={0} />
    {/* ...other cards unchanged... */}
    <ClockAnalogCard enterIndex={7} />
  </EditableBento>
);
```

### 6.2 `EditableBento` (new client component)

Lives at `src/components/home/bento/EditableBento.tsx`. Replaces `BentoStage`'s role as the layout container (the old `BentoStage` is absorbed into it; we keep the file name but make it client-side, since rewriting all imports is noise).

Responsibilities:
- Holds `layout` state, seeded from `initialLayout` (merged with code defaults).
- Holds `editMode` boolean, `saveStatus` (`idle | saving | error`), and `lastError`.
- Provides a `BentoLayoutContext` so each card can read its current `{x, y}` and the edit mode flag without prop drilling.
- Renders the bento markup (same outer `<main>` and inner sizing div from Round A's `BentoStage`).
- Renders the edit controls overlay (§7).
- Listens for the `Escape` key while in edit mode → discards.

### 6.3 Card position lookup

The 8 card components (`AboutCard`, `CalendarCard`, …) drop their hard-coded `style={{ left, top, width, height }}` on `CardFrame`. Instead they pass a `cardId` to `CardFrame`. `CardFrame` itself looks up `{x, y}` from `BentoLayoutContext`, falling back to the default if the context isn't present (so existing tests that render a card in isolation keep working).

```tsx
// CardFrame change (sketch)
const layoutCtx = useContext(BentoLayoutContext); // optional
const def = BENTO_DEFAULTS[cardId];
const { x, y } = layoutCtx?.layout[cardId] ?? { x: def.x, y: def.y };
const w = def.w;
const h = def.h;
const responsiveStyle = toResponsiveStyle({ left: x, top: y, width: w, height: h });
```

When `editMode` is on AND the viewport is `md` or wider, `CardFrame` switches its outer `motion.div` into `drag` mode with `dragConstraints` clamped to the bento canvas.

### 6.4 Defaults file

`src/lib/bento-defaults.ts` exports a frozen map:

```ts
export const BENTO_DEFAULTS: Record<CardId, { x: number; y: number; w: number; h: number }> = {
  about:        { x:  30, y: 130, w: 240, h: 230 },
  calendar:     { x: 350, y: 130, w: 160, h: 175 },
  photos:       { x: 605, y: 130, w: 250, h: 245 },
  "clock-lcd":  { x: 350, y: 330, w: 200, h:  80 },
  blog:         { x:  30, y: 390, w: 290, h: 170 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120 },
  music:        { x: 340, y: 440, w: 260, h:  76 },
  hanabi:       { x: 350, y: 532, w: 220, h:  65 },
};
```

These are Round A's table verbatim. Used both for fallbacks and to seed an empty server row.

## 7. Edit UI

All edit UI is desktop-only (rendered only when the viewport is `md` and wider — same breakpoint as the absolute bento layout itself).

### 7.1 Edit icon (when not in edit mode)

- Position: absolute top-right of the bento main area, with ~12px inset.
- Visual: a 14px pencil glyph (✎ or an inline SVG) wrapped in a small button with `text-muted hover:text-accent` and 2px padding. Subtle, no border.
- aria-label: `enter edit mode`.

### 7.2 Edit toolbar (when in edit mode)

Replaces the edit icon at the same anchor point. Three small buttons in a row separated by 8px:

```
[discard]   [save]   [save with key]
```

- Style: tiny serif lowercase text, `text-muted` default, hover bumps to `text-accent` or `text-cinnabar` for the destructive (`discard`) and the protected (`save with key`) actions respectively.
- `discard`: replaces local state with the server snapshot fetched on mount.
- `save`: just sets `editMode = false`. State is kept as-is.
- `save with key`: opens the inline key input (§7.3).

While in edit mode every card shows a subtle 1px dashed `--color-cinnabar` outline (0.5 opacity) and `cursor: grab`. During drag, `cursor: grabbing` and a slight shadow lift (`drop-shadow(0 8px 16px rgba(36,30,23,0.18))`).

### 7.3 Inline key input

When `save with key` is clicked, an inline strip slides down from the top-right toolbar (or simply appears below it) with:
- a single `<input type="password" autoFocus>` (28px tall, 180px wide, paper bg, 1px line border, monospace 13px)
- an `Enter` to submit, `Escape` to close
- a small `cancel` link to its right

On submit:
- The component sets `saveStatus = "saving"`, disables the input.
- Calls `PUT /api/bento-layout`.
- **200**: replaces local state with server response (canonical truth), shows a `toast` (§7.4), exits edit mode.
- **401**: turns the input's border `--color-cinnabar`, sets `saveStatus = "error"`, displays "wrong key" below the input; input is cleared and refocused.
- **other**: shows the generic message "save failed" below the input, leaves the user in edit mode.

### 7.4 Toast

After a successful key-save, a 220×40 pill at the bottom-center of the viewport reads "saved · live for everyone" in `--color-accent` text on `--color-surface-2`. Auto-dismisses after 2.5s with a slide-out animation. Single global toast slot — no queue needed.

### 7.5 No-edit-on-mobile

The edit icon and toolbar render inside a `<div className="hidden md:block">`. Below `md`, the user sees the static grid layout from Round A and never even knows the feature exists.

## 8. Drag mechanics

Use `framer-motion`'s `motion.div` with:
- `drag={editMode && !belowMd}`
- `dragConstraints={bentoRefBoxRef}` (ref to the inner sizing div whose dimensions are `880×600` scaled)
- `dragMomentum={false}` (no slide-out; pointer-tied)
- `dragSnapToOrigin` (so framer-motion's internal `x/y` springs back to 0 after release — the visible position then comes from the `left/top` percentage style bound to our React state)
- `onDragEnd`: read `info.offset` and translate the offset back to **reference-canvas pixels** (`refOffset = pixelOffset * (BENTO_REF_W / renderedWidth)`), then commit the new `{x, y}` to context state. The drag uses the GPU transform during the gesture; only the final position is persisted to state.
- Clamp committed `{x, y}` to `[0, BENTO_REF_W − w]` × `[0, BENTO_REF_H − h]` after translation, defending against off-by-one constraint slips.

In edit mode, suppress `whileHover` lift (the `y: -3` from Round A's CardFrame) so hover doesn't interfere with grab. The Round A entry animation (opacity + y) runs once at mount and is finished by the time the user can enter edit mode — no conflict with drag.

Drag is per-card. There is no marquee/group select.

## 9. Error and edge cases

- **Server returns 5xx on GET**: page still renders with code defaults. Edit icon still works, but Discard refetch will surface the error in the toast slot.
- **Network down mid-save**: catch the fetch error, show "save failed (offline?)" below the key input.
- **Stale fetch on rapid edits**: each PUT carries the full positions map, last-writer-wins.
- **Concurrent editors**: two visitors editing at once — last one to press `save with key` wins. We do **not** add an `If-Match` / version check (YAGNI for single-tenant blog).
- **Missing `BENTO_LAYOUT_KEY` env var**: server returns 500. Add a startup log line in the API route file so this is obvious in deploy logs.
- **Drag-end position out of bounds**: clamped (see §8).
- **Browser without `crypto.timingSafeEqual`**: not a concern — we run on Node 20+ on the server only.

## 10. Files

**New:**
- `src/lib/bento-defaults.ts` — id → default `{x,y,w,h}` map + `CardId` union.
- `src/lib/db/bento-layout.ts` — Prisma helpers: `getBentoLayout()`, `setBentoLayout(positions)`.
- `src/components/home/bento/EditableBento.tsx` — client wrapper, layout state, edit controls.
- `src/components/home/bento/EditToolbar.tsx` — the three-button toolbar + inline key input + toast.
- `src/components/home/bento/BentoLayoutContext.ts` — context with `layout`, `setCardPosition`, `editMode`.
- `src/app/api/bento-layout/route.ts` — GET + PUT route.
- `prisma/migrations/<date>_add_bento_layout/migration.sql` — generated migration.

**Modified:**
- `prisma/schema.prisma` — add `BentoLayout` model.
- `src/components/home/bento/CardFrame.tsx` — accept `cardId`, read from context, switch into drag-mode in edit mode.
- All 8 card components — drop the hard-coded `style={{ left, top, width, height }}` on `CardFrame`, pass `cardId` instead.
- `src/components/home/bento/BentoStage.tsx` — re-exports `EditableBento` (or is renamed; details in the plan).
- `src/app/(site)/page.tsx` — fetch the saved layout server-side and pass it in.
- `.env.example` — add `BENTO_LAYOUT_KEY` placeholder.

## 11. Testing

Unit (vitest + jsdom):
- `bento-layout.test.ts` — server-side fetch / set helpers with Prisma mocked.
- `bento-layout-api.test.ts` — GET returns merged positions, PUT with bad key returns 401, PUT with valid key persists, PUT with bad shape returns 400.
- `editable-bento.test.tsx` — edit mode toggles via the edit icon, dragging a card and pressing `save` keeps the new position in state, pressing `discard` resets, pressing `save with key` opens the key input.
- `edit-toolbar.test.tsx` — 401 path renders error, 200 path dismisses and shows toast.
- Existing per-card tests stay green — the `cardId` is now passed by the parent but the components still render the same DOM when not in edit mode.

Manual:
- Toggle viewport at `md` boundary to confirm edit icon hides on mobile.
- Wrong key → red border + message.
- Refresh after `save` (no key) → reverts to server state.
- Refresh after `save with key` → new layout sticks.

## 12. Out of scope (for clarity)

- Mobile drag-edit. Card resize. Card rotation (rotation is already locked to 0°). Hide/show cards. Add new cards.
- Per-visitor layouts (localStorage / cookie).
- Undo/redo within the edit session.
- Layout version history or restore.
- Multi-user "X is editing" indicators.
- CSRF tokens (the key itself is the only auth, and the endpoint is idempotent).
