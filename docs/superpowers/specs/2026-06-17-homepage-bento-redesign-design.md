# Homepage Bento Redesign — Design Spec

**Date:** 2026-06-17
**Status:** Approved for implementation planning

## Goal

Replace the current scrolling, multi-section homepage with a single-screen "bento" dashboard inspired by lvyovo-wiki.tech. Compress the existing personal-info content (Hero / About / Experience / Skills / Contact) into a new one-screen `/about` detail page in the antfu.me style.

## Non-Goals

- Rebuilding the blog or photos sub-systems
- Building the hanabi monitor (external link only)
- Mobile gestures beyond standard scroll
- Changing color theme (keep current warm paper palette)

## Information Architecture

| Route | Before | After |
|---|---|---|
| `/` | Scrolling 7-section landing | One-screen bento dashboard, 7 entry cards |
| `/about` | — | New one-screen detail page (antfu-style) |
| `/blog` | Unchanged | Unchanged |
| `/photos` | Unchanged | Unchanged |

The hanabi monitor is **not** a new route; the bento card opens `https://hanabi.chuckchen.org/` in a new tab.

### Disposition of current home components

| Component | Fate |
|---|---|
| `Hero` | Move into `/about` top bio block |
| `About` | Move into `/about` "Now" block |
| `Experience` | Condense; key items absorbed into bio / Now block |
| `SkillsMarquee` | Move into `/about` as a **static** tag cloud (no marquee animation) |
| `Contact` | Move into `/about` bottom block |
| `Philosophy` | Delete |
| `Featured` | Delete |

### Nav behavior

- `SiteNav` is **hidden** on `/` (bento cards are the navigation)
- Sub-pages (`/about`, `/blog`, `/photos`) continue to show `SiteNav`

## Homepage Composition

### Container

- `max-width: 880px`, horizontally centered
- `min-height: 100vh`, content vertically centered
- Horizontal padding: `20px`
- Background: existing `--color-paper` (#f3ede1). The page-edge overflow on wide screens is the same paper color, with no decoration.

### Static layers (no enter animation)

**Title block** (top-left)
- `Chuck Chen.` — serif, 60px, weight 700; the trailing `.` uses `--color-accent`
- Tagline `— a quiet corner of the internet` — italic, 10px, `--color-muted`

**Postmark layer** (top-right, scattered; CSS-only circular divs with 2px accent border, three lines of stacked text)
- `TOKYO · 2025 · JAPAN` — Ø 82px, position (left 740, top 46), opacity 0.7, rotate −8°
- `SHANGHAI · 2014 · CHINA` — Ø 72px, position (left 430, top 60), opacity 0.55, rotate 12°
- `LÜBECK · 2017 · GERMANY` — Ø 76px, position (left 590, top 80), opacity 0.5, rotate −14°
- Border / text color: `--color-accent`
- Vertical band y:46–156 inside container; none touching the top edge or the card area

**Date stamp** (bottom-right)
- Today's date in `YYYY.MM.DD`, italic serif, opacity 0.55, rotate −4°
- Computed at request time on the server

### Card layer (7 cards — animated, scattered, rotated)

Each card is absolutely positioned inside the 880px container, focusable and clickable. Coordinates are `left` / `top` in pixels relative to the container, measured from the top-left corner.

| # | Card | Position (left, top) | Size (W×H) | Rotation | Visual | Action |
|---|---|---|---|---|---|---|
| 1 | `AboutCard` | 30, 178 | 175 × 170 | −2° | Large white paper (`--color-surface-2`) | Link to `/about` |
| 2 | `CalendarCard` | 225, 190 | 105 × 105 | 3° | Pale square (`--color-surface`) | Static: big "DD" + mini month grid |
| 3 | `MusicCard` | 350, 208 | 200 × 58 | −3° | Accent-color pill (`--color-accent`, white text), rounded 30px | Random pick from curated list |
| 4 | `PhotosCard` | 570, 190 | 200 × 160 | −1° | Warm beige paper (`#e6d9bc`) | Link to `/photos` + latest photo bg |
| 5 | `BlogCard` | 350, 286 | 135 × 65 | −3° | White paper | Latest post title + date → `/blog` |
| 6 | `HanabiCard` | 225, 312 | 115 × 50 | 2° | White paper | External link, new tab |
| 7 | `GithubBadge` | 498, 296 | 50 × 50 | −8° | Dark circle (`--color-ink` bg, `--color-surface` text) | External link, new tab |

Paper-style cards share: 1px border `--color-line-2`, border-radius 6px, drop shadow `0 4px 10px rgba(36,30,23,0.12)`, internal padding 10px.

## `/about` Detail Page

### Container

- `max-width: 720px`, horizontally centered, vertically centered with `min-height: 100vh`
- Background: `--color-paper`
- `SiteNav` visible
- No bento aesthetic — document-style layout

### Content blocks (top to bottom)

1. **Identity** — 80px round avatar + `Chuck Chen` (serif) + one-line bio (e.g. `software engineer · Shanghai`). Bio text is placeholder; user will replace.
2. **Now** — 3-4 lines describing current focus. Placeholder; user will replace.
3. **Skills** — static tag cloud / grid (no marquee). Data sourced from the current `SkillsMarquee` array.
4. **Contact** — email + GitHub on one line, with icon glyphs.

### Animation

- Enter: each block fades up 12px with 80ms stagger (avatar → now → skills → contact)
- No rotation correction (detail page is "clean")
- Respect `prefers-reduced-motion`

## Animation Detail (Homepage)

### Enter animation

For each card, in stagger order with 100ms offset:
- From: `opacity: 0`, `translateY(16px)`, rotation `±8°` (starting tilt away from final)
- To: `opacity: 1`, `translateY(0)`, rotation `cardFinalAngle` (e.g. −2°, 3°, −3°)
- Duration: `600ms`
- Easing: cubic-bezier `(0.16, 1, 0.3, 1)` (gentle settle)

Stagger order: about → calendar → music → photos → blog → hanabi → github.

Title / postmarks / date stamp do not animate — they are present immediately.

### Hover

- Cards: `translateY(-3px)`, deeper shadow, 200ms transition
- `GithubBadge`: `scale(1.05)`, deeper shadow

### Reduced motion

When `prefers-reduced-motion: reduce`, skip all enter and hover transforms; cards appear in final state.

## Data Sources

| Card | Source |
|---|---|
| Calendar | `new Date()` server-side; renders today's number + current month grid |
| Music | `src/lib/music-playlist.ts` — static array of `{ title, artist, album? }`; server picks one at render time using `Math.random()` |
| Blog latest | Reuse existing blog query (whatever powers `/blog`); take the most recent post's title + date |
| Photos preview | Reuse existing photos query; take the most recent photo's URL + blurhash |
| About / Hanabi / GitHub | Static links — no data |

## Responsive Behavior

### Desktop (≥ 768px)

The 880px scattered layout described above.

### Mobile (< 768px)

- Drop absolute positioning; switch to a 2-column CSS grid
- Cards: `AboutCard` and `PhotosCard` span both columns; others span one column
- Card rotations reduce to ±2° (subtle)
- Postmarks shrink and stack at the top (centered, not scattered)
- Title font-size drops to 36px

## File Structure (new)

```
src/components/home/bento/
  BentoStage.tsx        # Container + centering
  TitleBlock.tsx        # Big title + tagline
  PostmarkLayer.tsx     # 3 postmarks + date stamp
  CardFrame.tsx         # Shared rotation + enter-animation wrapper
  cards/
    AboutCard.tsx
    CalendarCard.tsx
    MusicCard.tsx
    PhotosCard.tsx
    BlogCard.tsx
    HanabiCard.tsx
    GithubBadge.tsx

src/app/(site)/about/
  page.tsx              # New one-screen detail page

src/lib/music-playlist.ts  # Static curated track list
```

### Files removed / migrated

- `src/components/home/Hero.tsx` — content migrated to `/about`, file removed
- `src/components/home/About.tsx` — content migrated to `/about`, file removed
- `src/components/home/Experience.tsx` — content condensed into `/about`, file removed
- `src/components/home/SkillsMarquee.tsx` — converted to static tag cloud inside `/about`, original file removed
- `src/components/home/Philosophy.tsx` — deleted
- `src/components/home/Featured.tsx` — deleted
- `src/components/home/Contact.tsx` — content migrated to `/about`, file removed
- `src/app/(site)/page.tsx` — rewritten to render the new bento

### `SiteNav` change

- Add a conditional: when `pathname === "/"`, render nothing
- Implementation: use a client hook (`usePathname`) since `SiteNav` is already a client component

## Config Updates

- `src/lib/site-config.ts`: update `socials.github` to `https://github.com/chloroplast11`

## Dependencies

No new npm packages required. `framer-motion` is already in the project for animation; existing Tailwind v4 + theme tokens cover all styling.

## Open Items (deferred until implementation)

- Exact bio text, "Now" block content, contact email — user will replace placeholders post-implementation
- Music playlist initial contents — user will provide ~5–10 entries; first pass will seed with 3 placeholder tracks
- Avatar image — placeholder grey circle until user supplies an image asset
