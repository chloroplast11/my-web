# Bento Card Redesign — Round A (Visuals + Clock Cards)

**Date:** 2026-06-19
**Scope:** Visual redesign of the 6 existing bento cards + 2 new clock cards.
**Out of scope:** Drag-drop editor, layout persistence, key-based auth — those land in Round B.

---

## 1. Goal

Each card on the homepage should *look like the thing it represents*, not be a generic rounded rectangle. A calendar card should read as a calendar at a glance; a music card as music; a photo card as a photo; etc. We're keeping the existing warm-paper / vintage-collage feel, just sharpening each card's identity through shape, texture, and a single new accent color.

## 2. Theme tokens

Keep all current tokens in `globals.css`. **Add one extension:**

```css
--color-cinnabar: #b35336;  /* warm red — calendar header, festival ticket, library binding, accents */
```

This is the only new color. Everything else (paper / surface / ink / muted / faint / accent #9c6b3a / line) stays.

## 3. Per-card design

Tilt angles below mean the **outer wrapper** rotation. The CardFrame counter-rotation trick (rasterize text at 0°) is preserved unchanged.

### 3.1 AboutCard — "Library Author Card" (240×230, rotate +1°)

- Background: `--surface`, rounded 4px, existing soft shadow.
- **Left edge:** 3px solid `--cinnabar` (book-binding mark).
- **Horizontal ruling:** repeating-linear-gradient with `--line` at 22px intervals (almanac/ledger feel). Faint.
- Top: micro label `AUTHOR CARD` (8px, tracking 0.2em, uppercase, muted).
- Name: serif italic 18px bold ink "Chuck Chen".
- Role: 10px muted "software engineer · Shanghai".
- Tagline paragraph (existing copy): 10–11px muted, max 3 lines.
- **Bottom-right round seal stamp:** ~60×60 circle, 2px `--cinnabar` border, content `EST.` + `1995`, serif, rotated -12°, opacity 0.7.
- Bottom CTA: `about me →` — 10px `--accent`.
- The whole card is a `<Link href="/about">`.

### 3.2 CalendarCard — "Almanac Grid" (160×175, rotate +2°)

Refined version of the current grid card.

- Background: `--surface-2`, thin `--line-2` border.
- Header row: serif bold 13px month name (e.g., "June") + monospace 9px year (right-aligned), divider 1.5px solid `--accent` below.
- Weekday header: cinnabar bold 8px letters S M T W T F S.
- Day cells: ink for current-month days. Weekend (Sat/Sun) columns: subtle `--cinnabar` tint.
- **Today cell:** filled ink circle, surface-2 text, bold (already in current implementation).
- Empty cells stay blank.

### 3.3 MusicCard — "Vinyl + Pill" (260×76, rotate -2°)

Wrapper height is 76 (matches vinyl diameter) so the disc doesn't clip; the pill sits vertically centered inside.

- **Pill body** (240×60, brown `--accent` background, surface-2 text, full radius, existing shadow) — sits on the right of the 260px wrapper, vertically centered.
- **Vinyl disc** (76×76) overlapping the pill's left end:
  - Round, near-black body (`#1a1410`).
  - Grooves drawn with `radial-gradient` ring stack.
  - Center label: 22×22 circle, `--cinnabar`.
- **Animation:** vinyl rotates continuously, 6s linear infinite. Respect `prefers-reduced-motion` (skip the spin).
- Pill content: `♪ {title} — {artist}` (existing copy), truncated.

### 3.4 PhotosCard — "Album Page" (280×255, rotate -1°)

- Background: `--paper`, paper grain via 45° hatch (`repeating-linear-gradient` with very faint ink, ~2% opacity).
- Inner photo fills with ~14px padding on all sides.
- **Four corner mounts:** small dark triangular clips, ~16×16, in each corner of the photo (CSS clip-path triangles, ink color, 0.8 opacity).
- Top-left chip: existing `📷 photos` (white-translucent over photo, kept).
- Bottom-right caption chip: existing behavior.
- The whole card is a `<Link href="/photos">`.

### 3.5 BlogCard — "Newspaper Clipping" (290×170, rotate -2°)

- Background: `--surface-2`, thin `--line-2` border, existing shadow.
- **Torn bottom edge:** `clip-path: polygon(0 0, 100% 0, 100% 92%, 92% 100%, 50% 96%, 6% 100%, 0 95%)`.
- **Masthead:** serif italic bold 13px "The Quiet Times" + monospace 9px date (e.g., "2026.06.16"), 1.5px solid ink underline.
- **Volume line:** 8px tracked uppercase muted "Vol. III · Friday Edition" (the volume number = number of published posts // 10 + 1, or hardcoded simple — see Notes).
- **Headline:** serif bold 16px ink, line-height 1.15, line-clamp 2.
- **Byline:** 8px tracked uppercase cinnabar "— from the journal".
- **Excerpt:** 9.5px muted, `column-count: 2`, column-gap 10px, line-clamp ~4 visual lines.
- The whole card is a `<Link href="/blog">`.

**Volume number:** simple rule — start at "Vol. I" and increment per 10 published posts. If counting posts is awkward, fall back to a static "Vol. III" — it's decorative, not factual. Pick whichever is simpler.

### 3.6 HanabiCard — "Festival Ticket" (220×65, rotate +1°)

- Background: `--cinnabar`, surface-2 text, 4px radius, existing shadow.
- Two zones with a **vertical dashed divider at 68%** (1px dashed `rgba(255,255,255,0.6)`).
- **Left zone:** serif bold 13px "🎆 花火监控" + 9px subtitle "Tokyo · ticket alerts" (existing copy, restyled).
- **Right zone:** monospace, centered:
  - Big 16px bold "2026" (current year, dynamic)
  - 9px tracked "ADMIT ONE"
- The whole card is an `<a href="https://hanabi.chuckchen.org/" target="_blank" rel="noopener noreferrer">`.

### 3.7 ClockLcdCard — "LCD Readout" (200×80, rotate -1°) — **new**

- Outer bezel: `#1a1410`, 8px radius, inset 2px ring `#3a2f24`, padding 6px.
- Inner LCD face: `#2a2018`, 4px radius, centered.
- Digits: 'Courier New' monospace, 30px bold, `#f5b96b` (amber) with `text-shadow: 0 0 6px rgba(245,185,107,0.6)`.
- Format: `HH:MM` large + `:SS` 14px (0.7 opacity).
- **Live**: setInterval 1000ms; SSR placeholder of `--:--:--`, hydrate to real time on mount to avoid hydration mismatch.
- Local timezone of the visitor, 24-hour format.

### 3.8 ClockAnalogCard — "Mechanical Face" (120×120, rotate +2°) — **new**

- Round face: `--surface-2`, 2px solid `--ink` border, existing shadow.
- 4 minimal hour markers at 12 / 3 / 6 / 9: 9px serif muted.
- Hour hand: 2px wide, ~32px long, `--ink`, transform-origin bottom center.
- Minute hand: 1.5px wide, ~44px long, `--ink`.
- Second hand: 1px wide, ~46px long, `--cinnabar`.
- Center pivot: 6×6 `--cinnabar` circle.
- **Live**: setInterval 1000ms; SSR snapshot of "12:00" hand position, hydrate to real on mount. (Or render initial hands hidden; reveal after mount.)
- Local timezone, smooth tick (jump per second is fine — true sweep is gimmicky and expensive).

## 4. Reduced motion

- Vinyl: no spin.
- Clocks: still tick (it's data, not decoration). Reduced motion only suppresses purely-decorative animation.
- Hover lift / tilt-in: respect existing CardFrame `useReducedMotion`.

## 5. Default layout (loose)

Reference canvas extends from **880×480 → 880×600** to accommodate two new clock cards and the larger Blog. The exact pixel coords are a *starter default* — Round B's drag-drop will let anyone re-arrange.

| Card | x | y | w | h | notes |
|---|---|---|---|---|---|
| About | 30 | 130 | 240 | 230 | left column, top |
| Blog | 30 | 390 | 290 | 170 | left column, bottom |
| Calendar | 350 | 130 | 160 | 175 | mid column, top |
| ClockLCD | 350 | 330 | 200 | 80 | mid column, under calendar |
| Music | 340 | 440 | 260 | 76 | mid column, long pill |
| Hanabi | 350 | 532 | 220 | 65 | mid column, ticket |
| Photos | 605 | 130 | 250 | 245 | right column, top |
| ClockAnalog | 660 | 395 | 120 | 120 | right column, tucked under photos |

Verified non-overlapping with ≥15px breathing room on every adjacency. Title block (y 0–110) untouched, postmark layer remains in the top safety band (y 14–115).

BentoStage h: `md:h-[600px] xl:h-[750px] 2xl:h-[890px]` (proportional scale).

## 6. Files

**New:**
- `src/components/home/bento/cards/ClockLcdCard.tsx`
- `src/components/home/bento/cards/ClockAnalogCard.tsx`

**Modified (each card rewritten to its new visual):**
- `src/components/home/bento/cards/AboutCard.tsx`
- `src/components/home/bento/cards/CalendarCard.tsx`
- `src/components/home/bento/cards/MusicCard.tsx`
- `src/components/home/bento/cards/PhotosCard.tsx`
- `src/components/home/bento/cards/BlogCard.tsx`
- `src/components/home/bento/cards/HanabiCard.tsx`
- `src/components/home/bento/BentoStage.tsx` (canvas height 480 → 600)
- `src/app/(site)/page.tsx` (mount the two new clock cards)
- `src/app/globals.css` (add `--color-cinnabar`)

**Tests updated:** the unit tests in `src/tests/unit/{about,calendar,music,photos,blog,hanabi}-card.test.tsx` will likely break on text/structure assertions and need updating. Two new tests added for the clock cards (smoke: renders, updates on tick).

## 7. Typography sizing

User asked for "moderate" sizing. The card-internal type scale stays close to the current scale, just nudged for the new layouts:

- Titles / names: 13–16px
- Body / excerpt: 9.5–11px
- Micro labels / tracked uppercase: 8–9px
- Hero numerics (LCD, calendar day): 30–34px

xl / 2xl breakpoints continue to bump everything ~15% / ~30% as today.

## 8. Out of scope (Round B)

- Drag-drop edit mode and the position-saving UX.
- Server endpoint to persist layouts.
- Auth key gate for saving.
- localStorage for unsaved draft layout.

Round A produces the static card components and the default layout. Round B wraps them in an editor.
