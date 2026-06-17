# Homepage Bento Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scrolling multi-section homepage with a single-screen 880px-wide bento dashboard (7 entry cards + 3 postal stamps + big serif title) and add a new one-screen `/about` antfu-style detail page.

**Architecture:** Bento cards are absolutely positioned inside an 880px container; each card is a small React Client Component wrapped in a shared `CardFrame` that handles initial rotation, enter animation, and hover lift via Framer Motion. Static layers (title, postmarks, date stamp) render directly inside the stage and do not animate. Data flows top-down from the server component `app/(site)/page.tsx` which fetches latest blog post + latest photo + a random music track at request time.

**Tech Stack:** Next.js 16 (app router) · React 19 · Tailwind v4 (existing paper-tone tokens) · Framer Motion 12 · Prisma queries for blog/photo, in-process static lists for music.

## Global Constraints

- Theme tokens: use existing CSS vars only (`--color-paper`, `--color-surface`, `--color-surface-2`, `--color-ink`, `--color-muted`, `--color-faint`, `--color-accent`, `--color-line`, `--color-line-2`, `--font-serif`, `--font-body`). Do not introduce new color values except `#e6d9bc` for `PhotosCard` background and `#c8b896` for its border (already used in mockups).
- Tailwind v4 utility-first; no inline `style` for static styling except for the bento absolute coordinates and rotations.
- New components live under `src/components/home/bento/`.
- Framer Motion enter animation: duration 600ms, easing cubic-bezier `(0.16, 1, 0.3, 1)`, stagger 100ms between cards.
- All cards respect `prefers-reduced-motion: reduce` — skip enter/hover transforms, show final state immediately.
- Container `max-width: 880px` on home; `max-width: 720px` on `/about`.
- External links open in new tab with `target="_blank" rel="noopener noreferrer"`.
- Tests live in `src/tests/unit/` and use `@testing-library/react` + `vitest` (`jsdom`).

---

## File Map

**New files**

- `src/lib/music-playlist.ts` — static curated track list + random pick helper
- `src/components/home/bento/BentoStage.tsx` — 880px centered container, vertical centering, `min-height: 100vh`
- `src/components/home/bento/CardFrame.tsx` — shared client wrapper: enter animation + hover + final rotation
- `src/components/home/bento/TitleBlock.tsx` — `Chuck Chen.` big serif + tagline
- `src/components/home/bento/PostmarkLayer.tsx` — 3 postmarks + date stamp (server-rendered)
- `src/components/home/bento/cards/AboutCard.tsx`
- `src/components/home/bento/cards/CalendarCard.tsx`
- `src/components/home/bento/cards/MusicCard.tsx`
- `src/components/home/bento/cards/PhotosCard.tsx`
- `src/components/home/bento/cards/BlogCard.tsx`
- `src/components/home/bento/cards/HanabiCard.tsx`
- `src/components/home/bento/cards/GithubBadge.tsx`
- `src/app/(site)/about/page.tsx` — new detail page
- Test files mirroring each component under `src/tests/unit/`

**Modified files**

- `src/app/(site)/page.tsx` — rewrite to render bento
- `src/components/SiteNav.tsx` — hide on `/`
- `src/lib/site-config.ts` — update GitHub URL

**Deleted files**

- `src/components/home/Hero.tsx`
- `src/components/home/About.tsx`
- `src/components/home/Experience.tsx`
- `src/components/home/SkillsMarquee.tsx`
- `src/components/home/Philosophy.tsx`
- `src/components/home/Featured.tsx`
- `src/components/home/Contact.tsx`

---

## Task 1: Music Playlist Lib

**Files:**
- Create: `src/lib/music-playlist.ts`
- Test: `src/tests/unit/music-playlist.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export type Track = { title: string; artist: string; album?: string }`
  - `export const PLAYLIST: readonly Track[]`
  - `export function pickRandomTrack(rng?: () => number): Track` — uses `Math.random` by default; takes injectable RNG for deterministic tests

- [ ] **Step 1: Write the failing tests**

```ts
// src/tests/unit/music-playlist.test.ts
import { describe, it, expect } from "vitest";
import { PLAYLIST, pickRandomTrack, type Track } from "@/lib/music-playlist";

describe("music-playlist", () => {
  it("exposes a non-empty array of tracks with title + artist", () => {
    expect(PLAYLIST.length).toBeGreaterThan(0);
    for (const t of PLAYLIST) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.artist.length).toBeGreaterThan(0);
    }
  });

  it("pickRandomTrack returns a track from the playlist", () => {
    const t = pickRandomTrack(() => 0);
    expect(PLAYLIST).toContainEqual(t);
  });

  it("pickRandomTrack uses the injected RNG to index", () => {
    const t0: Track = pickRandomTrack(() => 0);
    const tLast: Track = pickRandomTrack(() => 0.9999);
    expect(t0).toEqual(PLAYLIST[0]);
    expect(tLast).toEqual(PLAYLIST[PLAYLIST.length - 1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- music-playlist`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the lib**

```ts
// src/lib/music-playlist.ts
export type Track = {
  title: string;
  artist: string;
  album?: string;
};

export const PLAYLIST: readonly Track[] = [
  { title: "Last Summer Whisper", artist: "Anri", album: "Timely!!" },
  { title: "Plastic Love", artist: "Mariya Takeuchi" },
  { title: "September", artist: "Earth, Wind & Fire" },
] as const;

export function pickRandomTrack(rng: () => number = Math.random): Track {
  const idx = Math.floor(rng() * PLAYLIST.length);
  return PLAYLIST[Math.min(idx, PLAYLIST.length - 1)];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- music-playlist`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/music-playlist.ts src/tests/unit/music-playlist.test.ts
git commit -m "feat(home): add curated music playlist with random pick helper"
```

---

## Task 2: BentoStage + CardFrame

`BentoStage` is the 880px centered container. `CardFrame` is the client wrapper every card uses: it sets the final rotation, runs the enter animation (initial tilt + lift + fade), and applies a hover lift. Reduced-motion preference disables transforms.

**Files:**
- Create: `src/components/home/bento/BentoStage.tsx`
- Create: `src/components/home/bento/CardFrame.tsx`
- Test: `src/tests/unit/bento-stage.test.tsx`
- Test: `src/tests/unit/card-frame.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export function BentoStage({ children }: { children: React.ReactNode }): JSX.Element` — server component, no client hooks
  - `export function CardFrame({ children, finalRotation, enterIndex, className, style }: { children: React.ReactNode; finalRotation: number; enterIndex: number; className?: string; style?: React.CSSProperties }): JSX.Element` — client component with `"use client"`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/tests/unit/bento-stage.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoStage } from "@/components/home/bento/BentoStage";

describe("BentoStage", () => {
  it("renders a centered container at max-width 880px", () => {
    const { container } = render(<BentoStage><span>x</span></BentoStage>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/mx-auto/);
    expect(root.className).toMatch(/max-w-\[880px\]/);
    expect(root.className).toMatch(/min-h-screen/);
    expect(root.textContent).toBe("x");
  });
});
```

```tsx
// src/tests/unit/card-frame.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardFrame } from "@/components/home/bento/CardFrame";

describe("CardFrame", () => {
  it("renders children inside a div", () => {
    const { getByText } = render(
      <CardFrame finalRotation={-2} enterIndex={0}>hello</CardFrame>,
    );
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("applies the final rotation as inline transform fallback", () => {
    const { container } = render(
      <CardFrame finalRotation={-2} enterIndex={0}>x</CardFrame>,
    );
    const root = container.firstChild as HTMLElement;
    // motion.div sets style.transform — we assert the final rotation appears
    expect(root.style.transform).toContain("rotate(-2deg)");
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <CardFrame
        finalRotation={3}
        enterIndex={1}
        className="custom"
        style={{ left: 10, top: 20 }}
      >
        x
      </CardFrame>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/custom/);
    expect(root.style.left).toBe("10px");
    expect(root.style.top).toBe("20px");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- bento-stage card-frame`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement BentoStage**

```tsx
// src/components/home/bento/BentoStage.tsx
import { cn } from "@/lib/cn";

export function BentoStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative mx-auto max-w-[880px] min-h-screen px-5 py-10",
        "flex items-center justify-center",
        className,
      )}
    >
      <div className="relative w-full" style={{ height: 380 }}>
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Implement CardFrame**

```tsx
// src/components/home/bento/CardFrame.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CardFrame({
  children,
  finalRotation,
  enterIndex,
  className,
  style,
}: {
  children: React.ReactNode;
  finalRotation: number;
  enterIndex: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  // Start tilt direction alternates so cards don't all rotate the same way
  const startTilt = enterIndex % 2 === 0 ? -8 : 8;

  if (reduced) {
    return (
      <div
        className={cn("absolute", className)}
        style={{ ...style, transform: `rotate(${finalRotation}deg)` }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("absolute will-change-transform", className)}
      style={{ ...style, transform: `rotate(${finalRotation}deg)` }}
      initial={{ opacity: 0, y: 16, rotate: startTilt }}
      animate={{ opacity: 1, y: 0, rotate: finalRotation }}
      transition={{ duration: 0.6, ease: EASE, delay: enterIndex * 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- bento-stage card-frame`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/bento/BentoStage.tsx src/components/home/bento/CardFrame.tsx src/tests/unit/bento-stage.test.tsx src/tests/unit/card-frame.test.tsx
git commit -m "feat(home/bento): add BentoStage container and CardFrame animation wrapper"
```

---

## Task 3: TitleBlock + PostmarkLayer + DateStamp

Static layers that render directly in the stage with absolute positions. Postmarks and date stamp are decoration (`aria-hidden`).

**Files:**
- Create: `src/components/home/bento/TitleBlock.tsx`
- Create: `src/components/home/bento/PostmarkLayer.tsx`
- Test: `src/tests/unit/title-block.test.tsx`
- Test: `src/tests/unit/postmark-layer.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export function TitleBlock(): JSX.Element` — renders `Chuck Chen.` + tagline
  - `export function PostmarkLayer({ today }: { today: Date }): JSX.Element` — renders 3 postmarks + today's date stamp

- [ ] **Step 1: Write the failing tests**

```tsx
// src/tests/unit/title-block.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TitleBlock } from "@/components/home/bento/TitleBlock";

describe("TitleBlock", () => {
  it("renders 'Chuck Chen.' with accent-colored period", () => {
    render(<TitleBlock />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Chuck Chen.");
    const dot = heading.querySelector("[data-accent]");
    expect(dot?.textContent).toBe(".");
  });

  it("renders the tagline below the title", () => {
    render(<TitleBlock />);
    expect(
      screen.getByText(/a quiet corner of the internet/i),
    ).toBeInTheDocument();
  });
});
```

```tsx
// src/tests/unit/postmark-layer.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostmarkLayer } from "@/components/home/bento/PostmarkLayer";

describe("PostmarkLayer", () => {
  const today = new Date("2026-06-17T00:00:00Z");

  it("renders three postmarks: TOKYO, SHANGHAI, LÜBECK", () => {
    render(<PostmarkLayer today={today} />);
    expect(screen.getByText("TOKYO")).toBeInTheDocument();
    expect(screen.getByText("SHANGHAI")).toBeInTheDocument();
    expect(screen.getByText("LÜBECK")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("2017")).toBeInTheDocument();
  });

  it("renders today's date as YYYY.MM.DD", () => {
    render(<PostmarkLayer today={today} />);
    expect(screen.getByText("2026.06.17")).toBeInTheDocument();
  });

  it("marks decorative layers as aria-hidden", () => {
    const { container } = render(<PostmarkLayer today={today} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- title-block postmark-layer`
Expected: FAIL.

- [ ] **Step 3: Implement TitleBlock**

```tsx
// src/components/home/bento/TitleBlock.tsx
export function TitleBlock() {
  return (
    <div className="absolute left-5 top-7">
      <h1 className="font-serif text-[60px] font-bold leading-none tracking-[-0.04em] text-ink">
        Chuck Chen<span data-accent className="text-accent">.</span>
      </h1>
      <p className="mt-4 text-[10px] italic text-muted">
        — a quiet corner of the internet
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement PostmarkLayer**

```tsx
// src/components/home/bento/PostmarkLayer.tsx
type Postmark = {
  city: string;
  year: string;
  country: string;
  size: number;
  left: number;
  top: number;
  rotate: number;
  opacity: number;
};

const POSTMARKS: readonly Postmark[] = [
  { city: "TOKYO",    year: "2025", country: "JAPAN",   size: 82, left: 740, top: 46, rotate: -8,  opacity: 0.7  },
  { city: "SHANGHAI", year: "2014", country: "CHINA",   size: 72, left: 430, top: 60, rotate: 12,  opacity: 0.55 },
  { city: "LÜBECK",   year: "2017", country: "GERMANY", size: 76, left: 590, top: 80, rotate: -14, opacity: 0.5  },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function PostmarkLayer({ today }: { today: Date }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {POSTMARKS.map((p) => (
        <div
          key={p.city}
          className="absolute flex flex-col items-center justify-center rounded-full border-2 border-accent font-serif text-accent"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <div className="text-[8px] font-semibold tracking-[0.18em]">{p.city}</div>
          <div className="my-0.5 text-[17px] font-bold leading-none">{p.year}</div>
          <div className="text-[7px] tracking-[0.12em]">{p.country}</div>
        </div>
      ))}
      <div
        className="absolute bottom-2 right-7 font-serif text-[13px] italic text-muted"
        style={{ opacity: 0.55, transform: "rotate(-4deg)" }}
      >
        {formatDate(today)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- title-block postmark-layer`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/bento/TitleBlock.tsx src/components/home/bento/PostmarkLayer.tsx src/tests/unit/title-block.test.tsx src/tests/unit/postmark-layer.test.tsx
git commit -m "feat(home/bento): add static title and postmark/date-stamp layers"
```

---

## Task 4: AboutCard

The largest card on the left, links to `/about`.

**Files:**
- Create: `src/components/home/bento/cards/AboutCard.tsx`
- Test: `src/tests/unit/about-card.test.tsx`

**Interfaces:**
- Consumes: `CardFrame` (Task 2)
- Produces: `export function AboutCard({ enterIndex }: { enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/about-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";

describe("AboutCard", () => {
  it("renders an internal link to /about with 'about' label", () => {
    render(<AboutCard enterIndex={0} />);
    const link = screen.getByRole("link", { name: /about/i });
    expect(link).toHaveAttribute("href", "/about");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- about-card`
Expected: FAIL.

- [ ] **Step 3: Implement AboutCard**

```tsx
// src/components/home/bento/cards/AboutCard.tsx
import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function AboutCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-2}
      enterIndex={enterIndex}
      style={{ left: 30, top: 178, width: 175, height: 170 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <Link
        href="/about"
        className="flex h-full w-full flex-col justify-between p-3 font-semibold text-ink"
      >
        <span className="text-[13px]">about</span>
        <span className="text-[9px] font-normal text-muted">→</span>
      </Link>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- about-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/bento/cards/AboutCard.tsx src/tests/unit/about-card.test.tsx
git commit -m "feat(home/bento): add AboutCard linking to /about"
```

---

## Task 5: CalendarCard

Static display — today's day number large, plus a small month label. No interaction.

**Files:**
- Create: `src/components/home/bento/cards/CalendarCard.tsx`
- Test: `src/tests/unit/calendar-card.test.tsx`

**Interfaces:**
- Consumes: `CardFrame`
- Produces: `export function CalendarCard({ today, enterIndex }: { today: Date; enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/calendar-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CalendarCard } from "@/components/home/bento/cards/CalendarCard";

describe("CalendarCard", () => {
  it("renders today's day-of-month number", () => {
    render(<CalendarCard today={new Date("2026-06-17T00:00:00Z")} enterIndex={1} />);
    expect(screen.getByText("17")).toBeInTheDocument();
  });

  it("renders the month abbreviation", () => {
    render(<CalendarCard today={new Date("2026-06-17T00:00:00Z")} enterIndex={1} />);
    expect(screen.getByText(/jun/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- calendar-card`
Expected: FAIL.

- [ ] **Step 3: Implement CalendarCard**

```tsx
// src/components/home/bento/cards/CalendarCard.tsx
import { CardFrame } from "../CardFrame";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function CalendarCard({ today, enterIndex }: { today: Date; enterIndex: number }) {
  const day = today.getDate();
  const month = MONTHS[today.getMonth()];

  return (
    <CardFrame
      finalRotation={3}
      enterIndex={enterIndex}
      style={{ left: 225, top: 190, width: 105, height: 105 }}
      className="rounded-md border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <div className="flex h-full w-full flex-col items-start justify-between p-3 text-muted">
        <span className="text-[9px] uppercase tracking-widest">{month}</span>
        <span className="self-end text-[28px] font-bold leading-none text-ink">{day}</span>
      </div>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- calendar-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/bento/cards/CalendarCard.tsx src/tests/unit/calendar-card.test.tsx
git commit -m "feat(home/bento): add CalendarCard with today's date"
```

---

## Task 6: MusicCard

Accent-color pill displaying a randomly picked track.

**Files:**
- Create: `src/components/home/bento/cards/MusicCard.tsx`
- Test: `src/tests/unit/music-card.test.tsx`

**Interfaces:**
- Consumes: `CardFrame`, `Track` from `@/lib/music-playlist`
- Produces: `export function MusicCard({ track, enterIndex }: { track: Track; enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/music-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";

describe("MusicCard", () => {
  it("renders the track title and artist", () => {
    render(
      <MusicCard
        track={{ title: "Plastic Love", artist: "Mariya Takeuchi" }}
        enterIndex={2}
      />,
    );
    expect(screen.getByText(/Plastic Love/)).toBeInTheDocument();
    expect(screen.getByText(/Mariya Takeuchi/)).toBeInTheDocument();
  });

  it("includes a musical note glyph prefix", () => {
    render(
      <MusicCard track={{ title: "x", artist: "y" }} enterIndex={2} />,
    );
    expect(screen.getByText(/♪/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- music-card`
Expected: FAIL.

- [ ] **Step 3: Implement MusicCard**

```tsx
// src/components/home/bento/cards/MusicCard.tsx
import { CardFrame } from "../CardFrame";
import type { Track } from "@/lib/music-playlist";

export function MusicCard({ track, enterIndex }: { track: Track; enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-3}
      enterIndex={enterIndex}
      style={{ left: 350, top: 208, width: 200, height: 58 }}
      className="flex items-center rounded-full bg-accent px-4 text-surface shadow-[0_4px_10px_rgba(36,30,23,0.18)]"
    >
      <span className="truncate text-[11px]">
        ♪ {track.title} — {track.artist}
      </span>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- music-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/bento/cards/MusicCard.tsx src/tests/unit/music-card.test.tsx
git commit -m "feat(home/bento): add MusicCard pill with track display"
```

---

## Task 7: PhotosCard

Larger card on the right, links to `/photos`, optionally shows the latest photo as background.

**Files:**
- Create: `src/components/home/bento/cards/PhotosCard.tsx`
- Test: `src/tests/unit/photos-card.test.tsx`

**Interfaces:**
- Consumes: `CardFrame`
- Produces:
  - `export type PhotoPreview = { src: string; alt?: string | null } | null`
  - `export function PhotosCard({ photo, enterIndex }: { photo: PhotoPreview; enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/photos-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotosCard } from "@/components/home/bento/cards/PhotosCard";

describe("PhotosCard", () => {
  it("renders an internal link to /photos with label", () => {
    render(<PhotosCard photo={null} enterIndex={3} />);
    const link = screen.getByRole("link", { name: /photos/i });
    expect(link).toHaveAttribute("href", "/photos");
  });

  it("renders the preview image when provided", () => {
    render(
      <PhotosCard
        photo={{ src: "https://example.com/p.jpg", alt: "preview" }}
        enterIndex={3}
      />,
    );
    const img = screen.getByAltText("preview") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/p.jpg");
  });

  it("shows the photos label even when image is missing", () => {
    render(<PhotosCard photo={null} enterIndex={3} />);
    expect(screen.getByText(/photos/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- photos-card`
Expected: FAIL.

- [ ] **Step 3: Implement PhotosCard**

```tsx
// src/components/home/bento/cards/PhotosCard.tsx
import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type PhotoPreview = { src: string; alt?: string | null } | null;

export function PhotosCard({
  photo,
  enterIndex,
}: {
  photo: PhotoPreview;
  enterIndex: number;
}) {
  return (
    <CardFrame
      finalRotation={-1}
      enterIndex={enterIndex}
      style={{ left: 570, top: 190, width: 200, height: 160, backgroundColor: "#e6d9bc", borderColor: "#c8b896" }}
      className="overflow-hidden rounded-md border shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <Link href="/photos" className="relative block h-full w-full">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={photo.alt ?? "photo preview"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <span className="absolute left-2 top-2 rounded bg-paper/80 px-1.5 py-0.5 text-[10px] text-muted backdrop-blur-sm">
          📷 photos
        </span>
      </Link>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- photos-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/bento/cards/PhotosCard.tsx src/tests/unit/photos-card.test.tsx
git commit -m "feat(home/bento): add PhotosCard with latest-photo preview"
```

---

## Task 8: BlogCard

Small paper card showing the latest published post title + date, links to `/blog`.

**Files:**
- Create: `src/components/home/bento/cards/BlogCard.tsx`
- Test: `src/tests/unit/blog-card.test.tsx`

**Interfaces:**
- Consumes: `CardFrame`
- Produces:
  - `export type BlogPreview = { title: string; publishedAt: Date | string } | null`
  - `export function BlogCard({ post, enterIndex }: { post: BlogPreview; enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/blog-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";

describe("BlogCard", () => {
  it("links to /blog", () => {
    render(<BlogCard post={null} enterIndex={4} />);
    const link = screen.getByRole("link", { name: /blog/i });
    expect(link).toHaveAttribute("href", "/blog");
  });

  it("shows the latest post title when provided", () => {
    render(
      <BlogCard
        post={{ title: "Hello World", publishedAt: new Date("2026-05-01") }}
        enterIndex={4}
      />,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("shows a placeholder when there are no posts", () => {
    render(<BlogCard post={null} enterIndex={4} />);
    expect(screen.getByText(/blog/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- blog-card`
Expected: FAIL.

- [ ] **Step 3: Implement BlogCard**

```tsx
// src/components/home/bento/cards/BlogCard.tsx
import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type BlogPreview = { title: string; publishedAt: Date | string } | null;

function formatRelativeDay(date: Date): string {
  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}

export function BlogCard({ post, enterIndex }: { post: BlogPreview; enterIndex: number }) {
  const date = post ? new Date(post.publishedAt) : null;
  return (
    <CardFrame
      finalRotation={-3}
      enterIndex={enterIndex}
      style={{ left: 350, top: 286, width: 135, height: 65 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <Link href="/blog" className="flex h-full w-full flex-col justify-between p-2.5 text-[10px] text-muted">
        <span>📝 blog</span>
        {post && date ? (
          <span className="truncate text-ink">
            <span className="block truncate">{post.title}</span>
            <span className="text-[9px] text-faint">{formatRelativeDay(date)}</span>
          </span>
        ) : (
          <span className="text-faint">no posts yet</span>
        )}
      </Link>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- blog-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/bento/cards/BlogCard.tsx src/tests/unit/blog-card.test.tsx
git commit -m "feat(home/bento): add BlogCard with latest post preview"
```

---

## Task 9: HanabiCard + GithubBadge

Two simple external link entries. Bundled because both are trivial and structurally similar.

**Files:**
- Create: `src/components/home/bento/cards/HanabiCard.tsx`
- Create: `src/components/home/bento/cards/GithubBadge.tsx`
- Test: `src/tests/unit/hanabi-card.test.tsx`
- Test: `src/tests/unit/github-badge.test.tsx`

**Interfaces:**
- Consumes: `CardFrame`
- Produces:
  - `export function HanabiCard({ enterIndex }: { enterIndex: number }): JSX.Element`
  - `export function GithubBadge({ href, enterIndex }: { href: string; enterIndex: number }): JSX.Element`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/tests/unit/hanabi-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";

describe("HanabiCard", () => {
  it("links to the external hanabi site in a new tab", () => {
    render(<HanabiCard enterIndex={5} />);
    const link = screen.getByRole("link", { name: /花火|hanabi/i });
    expect(link).toHaveAttribute("href", "https://hanabi.chuckchen.org/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

```tsx
// src/tests/unit/github-badge.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GithubBadge } from "@/components/home/bento/cards/GithubBadge";

describe("GithubBadge", () => {
  it("links to the provided GitHub URL in a new tab", () => {
    render(
      <GithubBadge href="https://github.com/chloroplast11" enterIndex={6} />,
    );
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", "https://github.com/chloroplast11");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- hanabi-card github-badge`
Expected: FAIL.

- [ ] **Step 3: Implement HanabiCard**

```tsx
// src/components/home/bento/cards/HanabiCard.tsx
import { CardFrame } from "../CardFrame";

export function HanabiCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={2}
      enterIndex={enterIndex}
      style={{ left: 225, top: 312, width: 115, height: 50 }}
      className="rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
    >
      <a
        href="https://hanabi.chuckchen.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center p-2.5 text-[10px] text-ink"
        aria-label="花火大会监控"
      >
        🎆 花火监控
      </a>
    </CardFrame>
  );
}
```

- [ ] **Step 4: Implement GithubBadge**

```tsx
// src/components/home/bento/cards/GithubBadge.tsx
import { CardFrame } from "../CardFrame";

export function GithubBadge({ href, enterIndex }: { href: string; enterIndex: number }) {
  return (
    <CardFrame
      finalRotation={-8}
      enterIndex={enterIndex}
      style={{ left: 498, top: 296, width: 50, height: 50 }}
      className="rounded-full bg-ink text-surface shadow-[0_4px_10px_rgba(36,30,23,0.2)]"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center justify-center text-[14px] font-semibold"
        aria-label="GitHub"
      >
        ⌥
      </a>
    </CardFrame>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- hanabi-card github-badge`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/bento/cards/HanabiCard.tsx src/components/home/bento/cards/GithubBadge.tsx src/tests/unit/hanabi-card.test.tsx src/tests/unit/github-badge.test.tsx
git commit -m "feat(home/bento): add HanabiCard and GithubBadge external link entries"
```

---

## Task 10: Update site-config GitHub URL

**Files:**
- Modify: `src/lib/site-config.ts`

- [ ] **Step 1: Update the file**

Open `src/lib/site-config.ts` and change the `github` value:

```ts
export const siteConfig = {
  name: "Chuck Chen",
  email: "chuck.chen@example.com",
  socials: {
    github: "https://github.com/chloroplast11",
    linkedin: "https://linkedin.com/in/chuck",
    twitter: "https://twitter.com/chuck",
  },
};
```

- [ ] **Step 2: Confirm typecheck passes**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/site-config.ts
git commit -m "chore(config): set real GitHub URL"
```

---

## Task 11: Rewrite Homepage to Bento + Hide SiteNav on `/`

This task wires everything together and hides `SiteNav` when on `/`.

**Files:**
- Modify: `src/app/(site)/page.tsx` — full rewrite
- Modify: `src/components/SiteNav.tsx` — return `null` when `pathname === "/"`
- Test: `src/tests/unit/site-nav.test.tsx`

**Interfaces:**
- Consumes: all components from Tasks 2–9, `pickRandomTrack` from Task 1, `siteConfig` (Task 10), `listPublishedPosts` from `@/lib/db/posts`, `prisma` from `@/lib/prisma`
- Produces: a working `/` route

- [ ] **Step 1: Write the failing SiteNav test**

```tsx
// src/tests/unit/site-nav.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";

describe("SiteNav", () => {
  it("renders nothing on the home route", () => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/");
    const { container } = render(<SiteNav />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the nav on other routes", () => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/blog");
    render(<SiteNav />);
    expect(screen.getByText(/Chuck/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- site-nav`
Expected: FAIL (current `SiteNav` always renders).

- [ ] **Step 3: Modify SiteNav**

```tsx
// src/components/SiteNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavScrolled } from "@/components/motion/NavScroll";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const pathname = usePathname();
  const scrolled = useNavScrolled();
  if (pathname === "/") return null;
  return (
    <nav className={cn(
      "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] transition-all duration-300 border-b",
      scrolled ? "bg-paper/85 backdrop-blur-md py-4 border-line" : "py-6 border-transparent",
    )}>
      <Link href="/" className="font-serif text-xl">Chuck <em className="text-accent not-italic">Chen</em></Link>
      <div className="hidden gap-8 text-sm md:flex">
        <Link href="/about">About</Link>
        <Link href="/blog">Writing</Link>
        <Link href="/photos">Photos</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- site-nav`
Expected: PASS.

- [ ] **Step 5: Rewrite the homepage**

```tsx
// src/app/(site)/page.tsx
import { BentoStage } from "@/components/home/bento/BentoStage";
import { TitleBlock } from "@/components/home/bento/TitleBlock";
import { PostmarkLayer } from "@/components/home/bento/PostmarkLayer";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";
import { CalendarCard } from "@/components/home/bento/cards/CalendarCard";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";
import { PhotosCard } from "@/components/home/bento/cards/PhotosCard";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";
import { GithubBadge } from "@/components/home/bento/cards/GithubBadge";
import { pickRandomTrack } from "@/lib/music-playlist";
import { listPublishedPosts } from "@/lib/db/posts";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";

export default async function HomePage() {
  const today = new Date();
  const track = pickRandomTrack();

  const [posts, latestPhoto] = await Promise.all([
    listPublishedPosts(),
    prisma.photo.findFirst({ orderBy: [{ createdAt: "desc" }] }),
  ]);

  const latestPost = posts[0]
    ? { title: posts[0].title, publishedAt: posts[0].publishedAt ?? new Date() }
    : null;

  const photoPreview = latestPhoto
    ? { src: latestPhoto.url, alt: latestPhoto.caption ?? null }
    : null;

  return (
    <>
      <BentoStage>
        <TitleBlock />
        <PostmarkLayer today={today} />
        <AboutCard enterIndex={0} />
        <CalendarCard today={today} enterIndex={1} />
        <MusicCard track={track} enterIndex={2} />
        <PhotosCard photo={photoPreview} enterIndex={3} />
        <BlogCard post={latestPost} enterIndex={4} />
        <HanabiCard enterIndex={5} />
        <GithubBadge href={siteConfig.socials.github} enterIndex={6} />
      </BentoStage>
      <PersonJsonLd />
    </>
  );
}
```

> **Note:** Confirm the actual Photo model field names before running. If `latestPhoto.url` or `latestPhoto.caption` do not exist in `prisma/schema.prisma`, replace with the correct field (e.g. `src`, `alt`). Use `grep -n "model Photo" prisma/schema.prisma -A 15` to inspect.

- [ ] **Step 6: Verify the dev server boots and the page renders**

Run: `npm run dev`
Open `http://localhost:3000/`.
Expected: bento layout shows title, 3 postmarks, 7 cards. SiteNav not present. Open `http://localhost:3000/blog` — SiteNav appears.

- [ ] **Step 7: Stop dev server and run typecheck + tests**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(site\)/page.tsx src/components/SiteNav.tsx src/tests/unit/site-nav.test.tsx
git commit -m "feat(home): wire bento homepage and hide SiteNav on /"
```

---

## Task 12: Build `/about` Detail Page

A one-screen antfu-style page with bio + Now + skills + contact. Static content for now; placeholders that the user will edit later.

**Files:**
- Create: `src/app/(site)/about/page.tsx`
- Test: `src/tests/unit/about-page.test.tsx`

**Interfaces:**
- Consumes: `siteConfig`
- Produces: a working `/about` route

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/unit/about-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "@/app/(site)/about/page";

describe("/about page", () => {
  it("renders the identity, now, skills, and contact blocks", async () => {
    const ui = await AboutPage();
    render(ui);
    expect(screen.getByRole("heading", { name: /chuck chen/i })).toBeInTheDocument();
    expect(screen.getByText(/now/i)).toBeInTheDocument();
    expect(screen.getByText(/skills/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it("links to the configured github profile", async () => {
    const ui = await AboutPage();
    render(ui);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("github.com"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- about-page`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the page**

```tsx
// src/app/(site)/about/page.tsx
import { siteConfig } from "@/lib/site-config";

const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js",
  "Postgres", "Prisma", "Tailwind", "Framer Motion",
];

export default async function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center gap-10 px-6 py-24">
      <header className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-paper-2 ring-1 ring-line-2" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Chuck Chen</h1>
          <p className="mt-1 text-sm text-muted">software engineer · Shanghai</p>
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Now</h2>
        <p className="text-sm leading-relaxed text-ink">
          Currently building things on the side, listening to a lot of city pop,
          and trying to keep this site small and quiet.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Skills</h2>
        <ul className="flex flex-wrap gap-2 text-xs">
          {SKILLS.map((s) => (
            <li key={s} className="rounded-full border border-line-2 px-3 py-1 text-muted">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Contact</h2>
        <p className="text-sm text-ink">
          <a className="underline-offset-2 hover:underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          {"  ·  "}
          <a
            className="underline-offset-2 hover:underline"
            href={siteConfig.socials.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- about-page`
Expected: PASS.

- [ ] **Step 5: Manually verify in dev server**

Run: `npm run dev`
Open `http://localhost:3000/about`.
Expected: single-screen page with identity, Now, Skills, Contact; SiteNav visible at top.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(site\)/about/page.tsx src/tests/unit/about-page.test.tsx
git commit -m "feat(about): add one-screen about detail page"
```

---

## Task 13: Delete Old Home Components

The new homepage no longer imports these. Delete to keep the file tree clean.

**Files:**
- Delete: `src/components/home/Hero.tsx`
- Delete: `src/components/home/About.tsx`
- Delete: `src/components/home/Experience.tsx`
- Delete: `src/components/home/SkillsMarquee.tsx`
- Delete: `src/components/home/Philosophy.tsx`
- Delete: `src/components/home/Featured.tsx`
- Delete: `src/components/home/Contact.tsx`

- [ ] **Step 1: Confirm no references remain**

Run: `grep -rn "from \"@/components/home/\(Hero\|About\|Experience\|SkillsMarquee\|Philosophy\|Featured\|Contact\)\"" src`
Expected: no matches (an empty result means safe to delete).

If any matches appear, investigate first — fix the import or postpone the delete.

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/home/Hero.tsx \
       src/components/home/About.tsx \
       src/components/home/Experience.tsx \
       src/components/home/SkillsMarquee.tsx \
       src/components/home/Philosophy.tsx \
       src/components/home/Featured.tsx \
       src/components/home/Contact.tsx
```

- [ ] **Step 3: Run typecheck + tests**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(home): remove obsolete pre-bento section components"
```

---

## Task 14: Mobile Responsive Layout (< 768px)

On narrow viewports the absolute-positioned layout breaks. Switch to a 2-column CSS grid below `md`.

**Files:**
- Modify: `src/components/home/bento/BentoStage.tsx`
- Modify: every card component to expose a "mobile fallback" sized via CSS
- Test: extend an existing test or add `src/tests/unit/bento-stage-mobile.test.tsx`

This task uses a single integrated approach: a CSS variable `--bento-mobile: 1` toggles via a media query inside the stage; cards switch from absolute (`md:absolute md:inset-auto`) to grid-cell positioning.

**Approach:** add `md:` prefix to all positioning inside `CardFrame` and `PostmarkLayer`. Cards use Tailwind's `relative md:absolute` and `w-full md:w-[…]` / `h-auto md:h-[…]` so they stack into the grid on mobile.

- [ ] **Step 1: Add a mobile grid wrapper to BentoStage**

Replace `BentoStage.tsx` body:

```tsx
// src/components/home/bento/BentoStage.tsx
import { cn } from "@/lib/cn";

export function BentoStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative mx-auto max-w-[880px] min-h-screen px-5 py-10",
        "md:flex md:items-center md:justify-center",
        className,
      )}
    >
      <div className="relative grid w-full grid-cols-2 gap-3 md:block md:h-[380px]">
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update CardFrame so absolute positioning only applies ≥ md**

```tsx
// src/components/home/bento/CardFrame.tsx (update the className handling)
// ... keep prior imports/exports ...
// In the reduced-motion branch:
return (
  <div
    className={cn("relative md:absolute", className)}
    style={{ ...style, transform: `rotate(${finalRotation}deg)` }}
  >
    {children}
  </div>
);

// In the motion.div branch:
return (
  <motion.div
    className={cn("relative md:absolute will-change-transform", className)}
    /* ... same as before ... */
  >
    {children}
  </motion.div>
);
```

Cards on mobile get their natural block size from grid cells; on desktop the inline `style` `left`/`top`/`width`/`height` takes over because the position becomes `absolute`. The inline `width` / `height` continue to apply on mobile but inside the grid cell they merely act as `max-width` upper bounds; cards will still flex to the grid column. If a card looks wrong on mobile, wrap its inner content in `w-full h-full` so it fills the grid cell.

- [ ] **Step 3: Make AboutCard and PhotosCard span both columns on mobile**

For each, add `col-span-2 md:col-span-1` to the outer className.

```tsx
// AboutCard outer className:
className="col-span-2 md:col-span-1 rounded-md border border-line-2 bg-surface-2 shadow-[0_4px_10px_rgba(36,30,23,0.12)]"

// PhotosCard outer className:
className="col-span-2 md:col-span-1 overflow-hidden rounded-md border shadow-[0_4px_10px_rgba(36,30,23,0.12)]"
```

- [ ] **Step 4: Update PostmarkLayer for mobile**

Postmarks stack at the top on mobile, hidden absolute coords:

```tsx
// PostmarkLayer.tsx — wrap stamps in a container that switches layout
return (
  <div aria-hidden="true" className="pointer-events-none mb-4 flex justify-center gap-2 md:absolute md:inset-0 md:mb-0 md:block">
    {POSTMARKS.map((p) => (
      <div
        key={p.city}
        className="flex flex-col items-center justify-center rounded-full border-2 border-accent font-serif text-accent md:absolute"
        style={{
          width: p.size * 0.7,           // shrink on mobile
          height: p.size * 0.7,
          opacity: p.opacity,
          transform: `rotate(${p.rotate}deg)`,
          // Desktop coords applied via inline left/top — only effective when md:absolute kicks in:
          left: p.left,
          top: p.top,
        }}
      >
        <div className="text-[8px] font-semibold tracking-[0.18em]">{p.city}</div>
        <div className="my-0.5 text-[15px] font-bold leading-none">{p.year}</div>
        <div className="text-[7px] tracking-[0.12em]">{p.country}</div>
      </div>
    ))}
    <div
      className="absolute bottom-2 right-7 hidden font-serif text-[13px] italic text-muted md:block"
      style={{ opacity: 0.55, transform: "rotate(-4deg)" }}
    >
      {formatDate(today)}
    </div>
  </div>
);
```

- [ ] **Step 5: Update TitleBlock for mobile (smaller text)**

```tsx
// TitleBlock.tsx
return (
  <div className="mb-6 md:absolute md:left-5 md:top-7 md:mb-0">
    <h1 className="font-serif text-[36px] font-bold leading-none tracking-[-0.04em] text-ink md:text-[60px]">
      Chuck Chen<span data-accent className="text-accent">.</span>
    </h1>
    <p className="mt-2 text-[10px] italic text-muted md:mt-4">
      — a quiet corner of the internet
    </p>
  </div>
);
```

- [ ] **Step 6: Manually verify mobile in dev server**

Run: `npm run dev`
Open Chrome DevTools, switch to a `<768px` viewport (e.g. iPhone 13).
Expected: title smaller, 3 postmarks stacked at top, cards in a 2-column grid (about / photos full-width), no horizontal scroll.

Switch back to desktop width (≥ 768px). Expected: original bento layout with absolute positioning.

- [ ] **Step 7: Run typecheck + tests**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/bento
git commit -m "feat(home/bento): responsive 2-col grid fallback for mobile"
```

---

## Task 15: Final Verification

End-to-end sanity check. No new code — just smoke-tests.

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: every test passes.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Build the production bundle**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual browser walkthrough**

Run: `npm run dev`

Visit each route and verify:

- `http://localhost:3000/` — bento renders; no SiteNav; cards animate in with stagger + rotation correct; hover lifts a card; clicking each card opens the right destination (about / blog / photos / hanabi external / github external). Calendar shows today's day + current month. Music card shows one of the playlist entries.
- `http://localhost:3000/about` — one-screen layout; SiteNav visible.
- `http://localhost:3000/blog` — unchanged; SiteNav visible.
- `http://localhost:3000/photos` — unchanged; SiteNav visible.

Resize to mobile width: bento switches to 2-column grid, postmarks stack at top.

Toggle macOS "Reduce motion" in System Settings → Accessibility → Display, refresh `/`. Expected: cards appear without animation, in final state, no rotation animation.

- [ ] **Step 6: Final commit if any tweaks were needed**

If steps 1–5 surfaced anything, fix it and commit. Otherwise no commit is needed.

---

## Self-Review Notes

**Spec coverage:**
- IA changes → Tasks 11, 12, 13 ✓
- Container 880px / centered → Task 2 ✓
- Title + tagline → Task 3 ✓
- 3 postmarks + date stamp → Task 3 ✓
- 7 cards w/ exact coords + rotations → Tasks 4–9 ✓
- Animation (enter stagger + rotation correct + hover lift + reduced-motion) → Task 2 ✓
- Data sources (calendar / music / photos / blog) → Tasks 1, 5, 6, 7, 8, 11 ✓
- SiteNav hidden on `/` → Task 11 ✓
- /about page → Task 12 ✓
- Mobile responsive → Task 14 ✓
- siteConfig GitHub URL → Task 10 ✓
- Delete obsolete files → Task 13 ✓

**Placeholder check:** Bio text and Now block text are spec-deferred and rendered as static placeholders; user will edit post-implementation per spec. No code placeholders in the plan.

**Type consistency:** `Track`, `PhotoPreview`, `BlogPreview` defined where first used and imported elsewhere with matching names. `enterIndex` consistent across all cards.
