# Personal Website — Phase 2: Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Phase 1 (`2026-05-21-phase-1-mvp.md`) is complete and the MVP is live.

**Goal:** Lift the site from "functional" to "memorable." Add the intro animation, the rich micro-interactions from the prototype, the Lightbox/blurhash/EXIF treatment for photos, and the SEO suite (metadata + OG image + sitemap + RSS + structured data).

**Architecture:** Animation layer = Framer Motion (in-view reveals + hero) + Lenis (smooth scroll) + a custom `IntroOverlay` client component for the three-language greeting and iris reveal. Photo enhancements = `sharp` (server) for blurhash + EXIF extraction, `yet-another-react-lightbox` for the viewer. SEO = Next.js `generateMetadata` per route + `@vercel/og` for OG images + RSS/sitemap routes.

**Tech Stack:** Adds Framer Motion · Lenis · Sharp · blurhash · exif-parser · yet-another-react-lightbox · feed · @vercel/og.

**Reference files:**
- Spec: `/Users/yuhang/Downloads/个人网站需求文档 (1).md` (§1.4 motion, §4.3 photos, §6 SEO)
- Prototype: `/Users/yuhang/Downloads/theme-prototype-light.html` (intro overlay + hero reveal + photo .exif overlay)

---

## File Structure (additions)

```
src/
├── components/
│   ├── motion/
│   │   ├── IntroOverlay.tsx          three-language greeting + iris circle
│   │   ├── SmoothScrollProvider.tsx  Lenis client wrapper
│   │   ├── HeroReveal.tsx            replaces static h1 with line-by-line reveal
│   │   ├── StatCounter.tsx           number rolls up on view
│   │   └── NavScroll.tsx             nav blur + collapse on scroll
│   ├── photos/
│   │   ├── Lightbox.tsx              lightbox + EXIF overlay (client)
│   │   ├── BlurredImage.tsx          next/image with blurhash placeholder
│   │   └── AlbumNav.tsx              collection filter
│   └── seo/
│       ├── PersonJsonLd.tsx
│       └── ArticleJsonLd.tsx
├── lib/
│   ├── image-processing.ts           server: blurhash + EXIF (Sharp + exif-parser)
│   └── seo.ts                        metadata helpers
├── app/
│   ├── opengraph-image.tsx           default OG image (dynamic /opengraph-image)
│   ├── blog/[slug]/opengraph-image.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── feed.xml/route.ts             RSS for the blog
└── prisma/
    └── migrations/<timestamp>_add_…  see Task 6 (Photo.blurhash already in schema)
```

---

## SECTION A — MOTION

---

## Task 1: Install motion + scroll deps

**Files:** `package.json`

- [ ] **Step 1: Install**

```bash
npm install framer-motion lenis
```

- [ ] **Step 2: Commit.**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and lenis"
```

---

## Task 2: Lenis smooth scroll provider

**Files:**
- Create: `src/components/motion/SmoothScrollProvider.tsx`
- Modify: `src/app/(site)/layout.tsx`

- [ ] **Step 1: Implement**

`src/components/motion/SmoothScrollProvider.tsx`:
```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let raf = 0;
    function loop(t: number) { lenis.raf(t); raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 2: Mount in site layout**

In `src/app/(site)/layout.tsx`, wrap children:
```tsx
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
…
<SmoothScrollProvider>
  <SiteNav />
  {children}
  <SiteFooter />
</SmoothScrollProvider>
```

- [ ] **Step 3: Manual check — scroll feels smoothed; `prefers-reduced-motion` disables.**

```bash
npm run dev
```
Scroll the home page. Then toggle "Reduce motion" in Chrome devtools → Rendering → Emulate. Refresh. Scrolling should snap back to native.

- [ ] **Step 4: Commit.**

```bash
git add src/components/motion/SmoothScrollProvider.tsx src/app/(site)/layout.tsx
git commit -m "feat(motion): lenis smooth scroll with reduced-motion guard"
```

---

## Task 3: Intro overlay (greeting + iris reveal)

**Files:**
- Create: `src/components/motion/IntroOverlay.tsx`
- Modify: `src/app/(site)/layout.tsx`
- Create: `src/tests/e2e/intro.spec.ts`

Spec-required behavior (§1.4): «你好 → Hello → こんにちは» each fades in with ~0.6s spacing, all three hold briefly, then the whole greeting fades out and the overlay clips away like a camera iris (`circle(150% → 0%)`). Repeat visits skip via `sessionStorage`. `prefers-reduced-motion` skips entirely.

- [ ] **Step 1: Failing e2e**

`src/tests/e2e/intro.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("intro overlay shows greetings on first visit and disappears", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/");
  await expect(page.getByText("你好")).toBeVisible();
  await expect(page.getByText("こんにちは")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator("[data-intro-overlay]")).toBeHidden({ timeout: 8_000 });
});

test("intro is skipped on second visit in the same session", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("[data-intro-overlay]", { state: "hidden", timeout: 8_000 });
  await page.reload();
  await expect(page.locator("[data-intro-overlay]")).toHaveCount(0);
});
```

- [ ] **Step 2: Implement `IntroOverlay.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "intro:seen:v1";
const GREETINGS = ["你好", "Hello", "こんにちは"];

export function IntroOverlay() {
  const [phase, setPhase] = useState<"hidden" | "greet" | "clearing">("hidden");
  const [shownLines, setShownLines] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setPhase("greet");
    document.body.style.overflow = "hidden";
    sessionStorage.setItem(STORAGE_KEY, "1");

    const lineTimers: number[] = [];
    GREETINGS.forEach((_, i) => {
      lineTimers.push(window.setTimeout(() => setShownLines(i + 1), 240 + i * 620));
    });
    const exitAt = 240 + (GREETINGS.length - 1) * 620 + 1260;
    const exit = window.setTimeout(() => setPhase("clearing"), exitAt);
    const done = window.setTimeout(() => {
      setPhase("hidden");
      document.body.style.overflow = "";
    }, exitAt + 1200);

    return () => {
      lineTimers.forEach(clearTimeout);
      clearTimeout(exit);
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      data-intro-overlay
      style={{ clipPath: phase === "clearing" ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)" }}
      className="fixed inset-0 z-[9999] bg-paper-2 flex items-center justify-center transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(.76,0,.24,1)]"
    >
      <div className={`flex flex-col items-center gap-1 transition-all duration-700 ease-out ${phase === "clearing" ? "opacity-0 -translate-y-3" : ""}`}>
        {GREETINGS.map((g, i) => (
          <span
            key={g}
            className={`font-serif font-light text-[clamp(1.8rem,6.2vw,3.6rem)] leading-tight text-ink transition-all duration-700 ease-out
              ${i < shownLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Mount above all other layout content**

In `src/app/(site)/layout.tsx`, render `<IntroOverlay />` just inside the fragment:
```tsx
<SmoothScrollProvider>
  <IntroOverlay />
  <SiteNav />
  …
</SmoothScrollProvider>
```

- [ ] **Step 4: Run e2e**

```bash
npx playwright test intro
```
Expected: both PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/components/motion/IntroOverlay.tsx src/app/(site)/layout.tsx src/tests/e2e/intro.spec.ts
git commit -m "feat(motion): three-language intro greeting + iris reveal"
```

---

## Task 4: Hero line-by-line reveal

**Files:**
- Create: `src/components/motion/HeroReveal.tsx`
- Modify: `src/components/home/Hero.tsx`

- [ ] **Step 1: Implement `HeroReveal.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";

export function HeroReveal({ lines }: { lines: React.ReactNode[] }) {
  return (
    <h1 className="font-serif font-light text-[clamp(2.8rem,8.5vw,6.8rem)] leading-[1.02] tracking-tight max-w-[15ch]">
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, delay: 0.45 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
```

- [ ] **Step 2: Replace static h1 in `Hero.tsx`**

```tsx
import { HeroReveal } from "@/components/motion/HeroReveal";
…
<HeroReveal lines={[
  <>I build thoughtful</>,
  <>things, and <em className="italic text-accent">chase</em></>,
  <em className="italic text-accent">good light.</em>,
]} />
```

- [ ] **Step 3: Re-run home e2e**

```bash
npx playwright test home
```
Expected: PASS (assertions only check text, not motion).

- [ ] **Step 4: Manual visual check.** Hard refresh `/`, watch the three lines rise after the intro ends.

- [ ] **Step 5: Commit.**

```bash
git add src/components/motion/HeroReveal.tsx src/components/home/Hero.tsx
git commit -m "feat(motion): hero h1 line-by-line reveal"
```

---

## Task 5: Stat counter animation

**Files:**
- Create: `src/components/motion/StatCounter.tsx`
- Modify: `src/components/home/About.tsx`

- [ ] **Step 1: Implement `StatCounter.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function StatCounter({ to, suffix = "", duration = 1300 }: { to: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      function step(t: number) {
        const p = Math.min((t - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}
```

- [ ] **Step 2: Wire into About.tsx**

Replace the `stats` map block in `About.tsx`:
```tsx
import { StatCounter } from "@/components/motion/StatCounter";
…
<div>
  <div className="font-serif font-light text-[2.7rem] tracking-tight">
    {typeof s.n === "number" ? <StatCounter to={s.n} /> : s.n}
  </div>
  <div className="text-xs tracking-[.14em] uppercase text-muted mt-1">{s.label}</div>
</div>
```

For the "240+" stat: `<StatCounter to={240} suffix="+" />` — change the `stats` array to `{ n: 240, suffix: "+" }` style and adjust.

- [ ] **Step 3: Commit.**

```bash
git add src/components/motion/StatCounter.tsx src/components/home/About.tsx
git commit -m "feat(motion): stat counter rolls up on view"
```

---

## Task 6: Nav scroll backdrop blur

**Files:**
- Create: `src/components/motion/NavScroll.tsx`
- Modify: `src/components/SiteNav.tsx`

- [ ] **Step 1: Implement `NavScroll.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";

export function useNavScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
```

- [ ] **Step 2: Convert `SiteNav.tsx` into a client component using the hook**

```tsx
"use client";
import Link from "next/link";
import { useNavScrolled } from "@/components/motion/NavScroll";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const scrolled = useNavScrolled();
  return (
    <nav className={cn(
      "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] transition-all duration-300 border-b",
      scrolled ? "bg-paper/85 backdrop-blur-md py-4 border-line" : "py-6 border-transparent",
    )}>
      <Link href="/" className="font-serif text-xl">Chuck <em className="text-accent not-italic">Chen</em></Link>
      <div className="hidden gap-8 text-sm md:flex">
        <Link href="/#about">About</Link>
        <Link href="/blog">Writing</Link>
        <Link href="/photos">Photos</Link>
        <Link href="/#contact">Contact</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Manual check.** Scroll the home page; nav should compress and gain a blurred background.

- [ ] **Step 4: Commit.**

```bash
git add src/components/SiteNav.tsx src/components/motion/NavScroll.tsx
git commit -m "feat(motion): nav scrolled state with backdrop blur"
```

---

## SECTION B — PHOTOS (LIGHTBOX, BLURHASH, EXIF)

---

## Task 7: Server-side blurhash + EXIF extraction

**Files:**
- Create: `src/lib/image-processing.ts`
- Create: `src/tests/unit/image-processing.test.ts`
- Modify: `src/app/admin/_actions/photos.ts` (use it on record)
- Modify: `prisma/schema.prisma` is already correct from Phase 0 (Photo.blurhash, Photo.exif, Photo.takenAt fields exist)

- [ ] **Step 1: Install deps**

```bash
npm install sharp blurhash exif-parser
npm install -D @types/exif-parser
```

- [ ] **Step 2: Failing unit test (uses a fixture image)**

`src/tests/unit/image-processing.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { processImage } from "@/lib/image-processing";

const fixture = readFileSync(path.resolve(__dirname, "../fixtures/sample.jpg"));

describe("processImage", () => {
  it("returns blurhash, dimensions, and stripped EXIF", async () => {
    const r = await processImage(fixture);
    expect(typeof r.blurhash).toBe("string");
    expect(r.blurhash.length).toBeGreaterThan(20);
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
    expect(r.exif).toBeTypeOf("object");
    if (r.exif && "gps" in (r.exif as object)) {
      expect((r.exif as { gps?: unknown }).gps).toBeUndefined();
    }
  });
});
```

- [ ] **Step 3: Implement `image-processing.ts`**

```ts
import sharp from "sharp";
import { encode } from "blurhash";
import ExifParser from "exif-parser";

export type ProcessedImage = {
  width: number;
  height: number;
  blurhash: string;
  exif: Record<string, unknown> | null;
  takenAt: Date | null;
};

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(buffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const { data, info } = await image
    .clone()
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);

  let exif: Record<string, unknown> | null = null;
  let takenAt: Date | null = null;
  try {
    const parsed = ExifParser.create(buffer).parse();
    const tags = parsed.tags ?? {};
    const safe: Record<string, unknown> = {
      make: tags.Make, model: tags.Model, lens: tags.LensModel,
      fNumber: tags.FNumber, exposureTime: tags.ExposureTime,
      iso: tags.ISO, focalLength: tags.FocalLength,
      focalLengthIn35mm: tags.FocalLengthIn35mmFormat,
    };
    Object.keys(safe).forEach((k) => safe[k] === undefined && delete safe[k]);
    exif = Object.keys(safe).length ? safe : null;
    if (tags.DateTimeOriginal) takenAt = new Date(tags.DateTimeOriginal * 1000);
  } catch { /* not all images have EXIF — fine */ }

  return { width, height, blurhash, exif, takenAt };
}
```

- [ ] **Step 4: Run unit test**

```bash
npm test -- image-processing
```
Expected: PASS.

- [ ] **Step 5: Wire into `recordUploadedPhoto`**

Update `src/app/admin/_actions/photos.ts`. The challenge: the photo was uploaded directly browser→Cloudinary, so the server doesn't have the bytes. Two options:

**Option A (chosen — simplest):** After the browser uploads, also send the file bytes to a server action that does the processing, and call the existing `recordUploadedPhoto` with `blurhash`/`exif`/`takenAt`.

Replace `recordUploadedPhoto`'s signature:
```ts
const RecordInput = z.object({
  cloudinaryPublicId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
  blurhash: z.string().nullable().optional(),
  exif: z.record(z.unknown()).nullable().optional(),
  takenAt: z.coerce.date().nullable().optional(),
});

export async function recordUploadedPhoto(input: z.infer<typeof RecordInput>) {
  await requireAdmin();
  const data = RecordInput.parse(input);
  await prisma.photo.create({
    data: {
      cloudinaryPublicId: data.cloudinaryPublicId,
      width: data.width,
      height: data.height,
      caption: data.caption,
      blurhash: data.blurhash ?? null,
      exif: (data.exif ?? null) as object | null,
      takenAt: data.takenAt ?? null,
    },
  });
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}
```

Add a separate action:
```ts
export async function processBlobForUpload(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("missing file");
  const buf = Buffer.from(await file.arrayBuffer());
  const { processImage } = await import("@/lib/image-processing");
  return await processImage(buf);
}
```

- [ ] **Step 6: Update `PhotoUploader.tsx` to call `processBlobForUpload` in parallel with the Cloudinary upload**

Replace the for-of body:
```ts
const creds = await getUploadCredentials();
const fd = new FormData();
fd.append("file", file);
fd.append("api_key", creds.apiKey);
fd.append("timestamp", String(creds.timestamp));
fd.append("signature", creds.signature);
fd.append("folder", creds.folder);

const processForm = new FormData();
processForm.append("file", file);

const [cldRes, processed] = await Promise.all([
  fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`, { method: "POST", body: fd }),
  processBlobForUpload(processForm),
]);
if (!cldRes.ok) throw new Error(`Upload failed: ${cldRes.status}`);
const json = await cldRes.json();

await recordUploadedPhoto({
  cloudinaryPublicId: json.public_id,
  width: json.width,
  height: json.height,
  blurhash: processed.blurhash,
  exif: processed.exif,
  takenAt: processed.takenAt,
});
```
Add `processBlobForUpload` to the imports.

- [ ] **Step 7: Manual smoke — re-upload a real photo, verify in DB it has blurhash + exif.**

```bash
npm run db:studio
```
Inspect the Photo row; `blurhash` should be non-null; `exif` should be a JSON object; `gps` should not exist.

- [ ] **Step 8: Commit.**

```bash
git add src/lib/image-processing.ts src/app/admin/_actions/photos.ts src/components/admin/PhotoUploader.tsx src/tests/unit/image-processing.test.ts package.json package-lock.json
git commit -m "feat(photos): server-side blurhash + EXIF extraction with GPS strip"
```

---

## Task 8: Blurred image placeholder component

**Files:**
- Create: `src/components/photos/BlurredImage.tsx`
- Modify: `src/components/photos/PhotoCard.tsx`

- [ ] **Step 1: Install helper for blurhash → data URL**

`next/image`'s `placeholder="blur"` needs a data URL. Use `blurhash` to decode to RGBA, then encode tiny PNG via Sharp on the server — but we render PhotoCard on the server already, so we can do it at render time.

Actually simpler: use a thumbHash-style 32×32 base64 PNG generated at upload time and stored. Schema change required (Photo.blurDataUrl). Or — at render time — use a CSS-only blurhash approach via the `blurhash` decode pushed to a `<canvas>` in a client component.

Choose: store `blurDataUrl` (base64 PNG) at upload time alongside `blurhash`. Add a migration.

Add field to `prisma/schema.prisma`:
```prisma
model Photo {
  …
  blurDataUrl String? @db.Text
  …
}
```

```bash
npm run db:migrate -- --name add_photo_blur_data_url
```

- [ ] **Step 2: Extend `processImage` to also emit a base64 PNG data URL**

Append in `image-processing.ts`:
```ts
import { decode } from "blurhash";

…
const pixels = decode(blurhash, 32, 32);
const png = await sharp(Buffer.from(pixels), { raw: { width: 32, height: 32, channels: 4 } })
  .png()
  .toBuffer();
const blurDataUrl = `data:image/png;base64,${png.toString("base64")}`;

return { width, height, blurhash, blurDataUrl, exif, takenAt };
```
Add `blurDataUrl: string` to the `ProcessedImage` type.

- [ ] **Step 3: Pipe `blurDataUrl` through `recordUploadedPhoto` and `PhotoUploader`**

Update the Zod schema + the call site (similar to blurhash).

- [ ] **Step 4: Implement `BlurredImage.tsx`**

```tsx
import Image from "next/image";

export function BlurredImage({
  publicId, alt, width, height, blurDataUrl, sizes,
}: { publicId: string; alt: string; width: number; height: number; blurDataUrl?: string | null; sizes?: string }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const src = `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto,w_1200/${publicId}`;
  return (
    <Image
      src={src} alt={alt} width={width} height={height} sizes={sizes ?? "(max-width:768px) 100vw, 50vw"}
      placeholder={blurDataUrl ? "blur" : "empty"}
      blurDataURL={blurDataUrl ?? undefined}
      className="w-full h-auto"
    />
  );
}
```

- [ ] **Step 5: Update `PhotoCard.tsx` to use `BlurredImage`**

```tsx
import { BlurredImage } from "./BlurredImage";

export function PhotoCard({
  publicId, alt, width, height, blurDataUrl,
}: { publicId: string; alt: string; width: number; height: number; blurDataUrl?: string | null }) {
  return (
    <div className="rounded-lg overflow-hidden mb-4 break-inside-avoid">
      <BlurredImage publicId={publicId} alt={alt} width={width} height={height} blurDataUrl={blurDataUrl} />
    </div>
  );
}
```

Update `PhotoGrid.tsx` to pass `blurDataUrl: p.blurDataUrl ?? null`.

- [ ] **Step 6: Re-upload one photo, verify the blur shows up before the full image loads (DevTools → throttle "Slow 4G").**

- [ ] **Step 7: Commit.**

```bash
git add prisma src/lib/image-processing.ts src/app/admin/_actions/photos.ts src/components/admin/PhotoUploader.tsx src/components/photos
git commit -m "feat(photos): blurhash → data url placeholder via next/image blur"
```

---

## Task 9: Lightbox with EXIF overlay

**Files:**
- Create: `src/components/photos/Lightbox.tsx`
- Modify: `src/components/photos/PhotoGrid.tsx` (open lightbox on click)

- [ ] **Step 1: Install**

```bash
npm install yet-another-react-lightbox
```

- [ ] **Step 2: Implement `Lightbox.tsx`**

```tsx
"use client";
import { useState } from "react";
import RYALightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@prisma/client";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const fullUrl = (id: string) => `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_2400/${id}`;

function formatExif(e: Photo["exif"]): string | null {
  if (!e || typeof e !== "object") return null;
  const x = e as Record<string, unknown>;
  const parts: string[] = [];
  if (x.make || x.model) parts.push([x.make, x.model].filter(Boolean).join(" "));
  if (x.lens) parts.push(String(x.lens));
  if (x.focalLength) parts.push(`${x.focalLength}mm`);
  if (x.fNumber) parts.push(`f/${x.fNumber}`);
  if (x.exposureTime) {
    const t = Number(x.exposureTime);
    parts.push(t < 1 ? `1/${Math.round(1 / t)}s` : `${t}s`);
  }
  if (x.iso) parts.push(`ISO ${x.iso}`);
  return parts.join(" · ") || null;
}

export function PhotoLightbox({ photos, openIndex, onClose }: {
  photos: Photo[]; openIndex: number | null; onClose: () => void;
}) {
  const [index, setIndex] = useState(openIndex ?? 0);
  if (openIndex === null) return null;
  return (
    <RYALightbox
      open
      close={onClose}
      index={openIndex}
      slides={photos.map((p) => ({
        src: fullUrl(p.cloudinaryPublicId),
        width: p.width, height: p.height, alt: p.caption ?? "",
        description: formatExif(p.exif) ?? undefined,
      }))}
      on={{ view: ({ index }) => setIndex(index) }}
    />
  );
}
```

- [ ] **Step 3: Update `PhotoGrid.tsx` to be a client component that opens the lightbox**

```tsx
"use client";
import { useState } from "react";
import type { Photo } from "@prisma/client";
import { BlurredImage } from "./BlurredImage";
import { PhotoLightbox } from "./Lightbox";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        {photos.map((p, i) => (
          <button
            key={p.id} type="button" onClick={() => setOpenIndex(i)}
            className="block w-full text-left mb-4 break-inside-avoid rounded-lg overflow-hidden"
          >
            <BlurredImage
              publicId={p.cloudinaryPublicId} alt={p.caption ?? ""}
              width={p.width} height={p.height} blurDataUrl={p.blurDataUrl}
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </button>
        ))}
      </div>
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
```

- [ ] **Step 4: Manual check — click a photo, lightbox opens, left/right arrow keys work, EXIF visible in caption, Esc closes.**

- [ ] **Step 5: Commit.**

```bash
git add src/components/photos package.json package-lock.json
git commit -m "feat(photos): lightbox with EXIF caption and high-res load"
```

---

## Task 10: Album/Collections (optional grouping)

**Files:**
- Create: `src/app/admin/albums/page.tsx`
- Create: `src/app/admin/_actions/albums.ts`
- Modify: `src/app/(site)/photos/page.tsx` (filter by ?album=slug)
- Modify: `src/components/admin/PhotoUploader.tsx` (let user pick album)

- [ ] **Step 1: Album actions**

`src/app/admin/_actions/albums.ts`:
```ts
"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() { const s = await auth(); if (!s?.user?.id) throw new Error("Unauthorized"); }

export async function createAlbum(formData: FormData) {
  await requireAdmin();
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.album.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/albums");
  revalidatePath("/photos");
}

export async function assignPhotoToAlbum(photoId: string, albumId: string | null) {
  await requireAdmin();
  await prisma.photo.update({ where: { id: photoId }, data: { albumId } });
  revalidatePath("/photos");
}
```

- [ ] **Step 2: Album admin page**

```tsx
import { prisma } from "@/lib/prisma";
import { createAlbum } from "@/app/admin/_actions/albums";

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({ include: { _count: { select: { photos: true } } }, orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Albums</h1>
      <form action={createAlbum} className="flex gap-2">
        <input name="name" required placeholder="New album" className="border border-line p-2 rounded flex-1" />
        <button className="px-4 py-2 bg-ink text-paper rounded">Create</button>
      </form>
      <ul className="divide-y divide-line">
        {albums.map((a) => (
          <li key={a.id} className="py-3 flex justify-between">
            <span>{a.name} <span className="text-muted text-sm ml-2">/{a.slug}</span></span>
            <span className="text-muted text-sm">{a._count.photos} photos</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Filter `/photos` by album slug**

`src/app/(site)/photos/page.tsx`:
```tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { cn } from "@/lib/cn";

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ album?: string }> }) {
  const { album } = await searchParams;
  const [albums, photos] = await Promise.all([
    prisma.album.findMany({ orderBy: { order: "asc" } }),
    prisma.photo.findMany({
      where: album ? { album: { slug: album } } : {},
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  return (
    <main className="px-[5vw] pt-32 pb-24 max-w-[var(--container-site)] mx-auto">
      <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)]">Photography</h1>
      {albums.length > 0 && (
        <div className="flex gap-3 mt-8 flex-wrap">
          <Link href="/photos" className={cn("text-sm", !album ? "text-accent" : "text-muted")}>All</Link>
          {albums.map((a) => (
            <Link key={a.id} href={`/photos?album=${a.slug}`} className={cn("text-sm", album === a.slug ? "text-accent" : "text-muted")}>
              {a.name}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-12">
        <PhotoGrid photos={photos} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Add album dropdown in `PhotoUploader.tsx`**

Make `PhotoUploader.tsx` accept an `albums` prop and forward the selected album id to `recordUploadedPhoto`:
```tsx
"use client";
import { useState } from "react";
import { getUploadCredentials, recordUploadedPhoto, processBlobForUpload } from "@/app/admin/_actions/photos";

export function PhotoUploader({ albums }: { albums: { id: string; name: string }[] }) {
  const [albumId, setAlbumId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true); setError(null);
    try {
      for (const file of files) {
        const creds = await getUploadCredentials();
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", creds.apiKey);
        fd.append("timestamp", String(creds.timestamp));
        fd.append("signature", creds.signature);
        fd.append("folder", creds.folder);
        const processForm = new FormData();
        processForm.append("file", file);
        const [cldRes, processed] = await Promise.all([
          fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`, { method: "POST", body: fd }),
          processBlobForUpload(processForm),
        ]);
        if (!cldRes.ok) throw new Error(`Upload failed: ${cldRes.status}`);
        const json = await cldRes.json();
        await recordUploadedPhoto({
          cloudinaryPublicId: json.public_id,
          width: json.width, height: json.height,
          blurhash: processed.blurhash, blurDataUrl: processed.blurDataUrl,
          exif: processed.exif, takenAt: processed.takenAt,
          albumId: albumId || null,
        });
      }
      e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-dashed border-line rounded-xl p-8 text-center space-y-4">
      <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="border border-line rounded p-2">
        <option value="">No album</option>
        {albums.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <div>
        <input id="file" type="file" accept="image/*" multiple onChange={onChange} disabled={uploading} className="hidden" />
        <label htmlFor="file" className="cursor-pointer px-5 py-3 rounded-full bg-ink text-paper inline-block">
          {uploading ? "Uploading…" : "Upload photos"}
        </label>
      </div>
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </div>
  );
}
```

Then extend the `recordUploadedPhoto` Zod schema in `src/app/admin/_actions/photos.ts` to accept `albumId: z.string().nullable().optional()` and pass it through to `prisma.photo.create`.

Finally, update `src/app/admin/photos/page.tsx` to fetch albums and pass them in:
```tsx
import { prisma } from "@/lib/prisma";
…
const [photos, albums] = await Promise.all([
  listPhotos(),
  prisma.album.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
]);
…
<PhotoUploader albums={albums} />
```

- [ ] **Step 5: Commit.**

```bash
git add src/app/admin/albums src/app/admin/_actions/albums.ts src/app/(site)/photos
git commit -m "feat(photos): albums grouping with filter"
```

---

## SECTION C — SEO

---

## Task 11: Per-route metadata helper

**Files:**
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Implement**

```ts
import type { Metadata } from "next";
import { siteConfig } from "./site-config";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: `${siteConfig.name} — Frontend Engineer & Photographer`, template: `%s · ${siteConfig.name}` },
  description: "A frontend engineer in Tokyo who chases good light.",
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: siteConfig.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", creator: "@chuck" },
};

export function postMetadata(opts: {
  title: string; excerpt?: string | null; slug: string; publishedAt?: Date | null; language: "en" | "zh" | "ja";
}): Metadata {
  const url = `${baseUrl}/blog/${opts.slug}`;
  return {
    title: opts.title,
    description: opts.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article", url, title: opts.title, description: opts.excerpt ?? undefined,
      publishedTime: opts.publishedAt?.toISOString(), locale: opts.language === "zh" ? "zh_CN" : opts.language === "ja" ? "ja_JP" : "en_US",
    },
  };
}
```

- [ ] **Step 2: Add `NEXT_PUBLIC_SITE_URL` to `.env.example` and `.env.local`.**

- [ ] **Step 3: Wire `defaultMetadata` into root layout**

`src/app/layout.tsx`:
```ts
import { defaultMetadata } from "@/lib/seo";
export const metadata = defaultMetadata;
```

- [ ] **Step 4: Add `generateMetadata` to blog detail page**

In `src/app/(site)/blog/[slug]/page.tsx`:
```ts
import { postMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return postMetadata({
    title: post.title, excerpt: post.excerpt, slug: post.slug,
    publishedAt: post.publishedAt, language: post.language,
  });
}
```

- [ ] **Step 5: Curl-test produced HTML**

```bash
npm run build && npm start
curl -s http://localhost:3000/blog/<some-slug> | grep -E "og:title|og:description|canonical"
```
Expected: lines present. Ctrl-C.

- [ ] **Step 6: Commit.**

```bash
git add src/lib/seo.ts src/app/layout.tsx src/app/(site)/blog/[slug]/page.tsx .env.example
git commit -m "feat(seo): default + per-post metadata with Open Graph"
```

---

## Task 12: Dynamic OG image

**Files:**
- Create: `src/app/opengraph-image.tsx` (default)
- Create: `src/app/(site)/blog/[slug]/opengraph-image.tsx` (per post)

- [ ] **Step 1: Install**

```bash
npm install @vercel/og
```
(Available natively in Next.js without the package via `next/og` — but explicit install removes ambiguity. Actually `next/og` is built-in; skip the install.)

- [ ] **Step 2: Default OG**

`src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", background: "#f3ede1", color: "#241e17",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px",
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ fontSize: 30, color: "#9c6b3a", letterSpacing: 4 }}>CHUCK CHEN</div>
        <div style={{ fontSize: 80, marginTop: 40, lineHeight: 1.05 }}>
          Frontend Engineer <span style={{ color: "#9c6b3a", fontStyle: "italic" }}>&amp; Photographer</span>
        </div>
        <div style={{ fontSize: 28, color: "#796f62", marginTop: 30 }}>Tokyo</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: Per-post OG**

`src/app/(site)/blog/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { getPublishedPostBySlug } from "@/lib/db/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGPost({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug);
  const title = post?.title ?? "Chuck Chen";
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", background: "#f3ede1", color: "#241e17",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "80px",
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ fontSize: 24, color: "#9c6b3a", letterSpacing: 4 }}>WRITING</div>
        <div style={{ fontSize: 72, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 24, color: "#796f62" }}>chuckchen.dev</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Build + verify**

```bash
npm run build
```
Expected: builds OK. Hit a post URL in production after deploy — `<meta property="og:image">` should point to the generated PNG.

- [ ] **Step 5: Commit.**

```bash
git add src/app/opengraph-image.tsx "src/app/(site)/blog/[slug]/opengraph-image.tsx"
git commit -m "feat(seo): dynamic OG images for site and posts"
```

---

## Task 13: sitemap.xml + robots.txt

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: Implement `sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    { url: `${base}/photos`, lastModified: new Date() },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
```

- [ ] **Step 2: Implement `robots.ts`**

```ts
import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify**

```bash
npm run build && npm start
curl -s http://localhost:3000/sitemap.xml | head -20
curl -s http://localhost:3000/robots.txt
```
Expected: well-formed XML; robots.txt has Disallow lines.

- [ ] **Step 4: Commit.**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): sitemap.xml and robots.txt"
```

---

## Task 14: RSS feed

**Files:**
- Create: `src/app/feed.xml/route.ts`

- [ ] **Step 1: Install**

```bash
npm install feed
```

- [ ] **Step 2: Implement**

```ts
import { Feed } from "feed";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" }, take: 30,
  });
  const feed = new Feed({
    title: `${siteConfig.name} — Writing`,
    description: "Notes on engineering, design, and the light I keep chasing.",
    id: base, link: base, language: "en",
    image: `${base}/opengraph-image`,
    favicon: `${base}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: { rss2: `${base}/feed.xml` },
    author: { name: siteConfig.name, email: siteConfig.email, link: base },
  });
  for (const p of posts) {
    feed.addItem({
      title: p.title, id: `${base}/blog/${p.slug}`, link: `${base}/blog/${p.slug}`,
      description: p.excerpt ?? undefined,
      content: p.contentHtml ?? undefined,
      date: p.publishedAt ?? p.createdAt,
    });
  }
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/xml" },
  });
}
```

- [ ] **Step 3: Verify**

```bash
curl -sf http://localhost:3000/feed.xml | head -30
```
Expected: valid RSS XML.

- [ ] **Step 4: Commit.**

```bash
git add src/app/feed.xml package.json package-lock.json
git commit -m "feat(seo): rss feed at /feed.xml"
```

---

## Task 15: Structured data (Person + Article)

**Files:**
- Create: `src/components/seo/PersonJsonLd.tsx`, `src/components/seo/ArticleJsonLd.tsx`
- Modify: `src/app/(site)/page.tsx` (mount Person), `src/app/(site)/blog/[slug]/page.tsx` (mount Article)

- [ ] **Step 1: `PersonJsonLd.tsx`**

```tsx
import { siteConfig } from "@/lib/site-config";
const base = process.env.NEXT_PUBLIC_SITE_URL!;

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org", "@type": "Person",
    name: siteConfig.name, url: base, email: `mailto:${siteConfig.email}`,
    jobTitle: "Frontend Engineer",
    sameAs: Object.values(siteConfig.socials),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

- [ ] **Step 2: `ArticleJsonLd.tsx`**

```tsx
import { siteConfig } from "@/lib/site-config";
const base = process.env.NEXT_PUBLIC_SITE_URL!;

export function ArticleJsonLd({
  title, slug, publishedAt, excerpt,
}: { title: string; slug: string; publishedAt: Date | null; excerpt: string | null }) {
  const data = {
    "@context": "https://schema.org", "@type": "Article", headline: title,
    description: excerpt ?? undefined,
    url: `${base}/blog/${slug}`,
    datePublished: publishedAt?.toISOString(),
    author: { "@type": "Person", name: siteConfig.name, url: base },
    image: `${base}/blog/${slug}/opengraph-image`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

- [ ] **Step 3: Mount** — add `<PersonJsonLd />` to bottom of home; add `<ArticleJsonLd …/>` to top of post detail.

- [ ] **Step 4: Validate**

After deploy, paste a post URL into Google's Rich Results Test (https://search.google.com/test/rich-results). Expected: Article detected, no errors.

- [ ] **Step 5: Commit.**

```bash
git add src/components/seo src/app/(site)/page.tsx "src/app/(site)/blog/[slug]/page.tsx"
git commit -m "feat(seo): Person + Article JSON-LD structured data"
```

---

## Task 16: TOC for long posts

**Files:**
- Create: `src/components/blog/TableOfContents.tsx`
- Modify: `src/app/(site)/blog/[slug]/page.tsx`

- [ ] **Step 1: Heading-extraction utility**

`src/lib/extract-headings.ts`:
```ts
export type Heading = { id: string; text: string; level: 2 | 3 };

export function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const level = Number(m[1]) as 2 | 3;
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    out.push({ id, text, level });
  }
  return out;
}

export function addHeadingIds(html: string): string {
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_full, lvl, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `<h${lvl} id="${id}"${attrs ?? ""}>${inner}</h${lvl}>`;
  });
}
```

- [ ] **Step 2: Plumb `addHeadingIds` into `renderPostHtml`**

In `src/lib/blocknote/render.ts`, after sanitize and before code highlight:
```ts
import { addHeadingIds } from "@/lib/extract-headings";
…
const withIds = addHeadingIds(safe);
return await highlightCodeBlocks(withIds);
```

- [ ] **Step 3: TOC component**

```tsx
import type { Heading } from "@/lib/extract-headings";
import { cn } from "@/lib/cn";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;
  return (
    <aside className="hidden lg:block sticky top-32 text-sm space-y-2">
      <div className="text-xs uppercase tracking-wider text-muted mb-3">On this page</div>
      <ul className="space-y-2 border-l border-line pl-4">
        {headings.map((h) => (
          <li key={h.id} className={cn("leading-snug", h.level === 3 && "ml-3 text-muted")}>
            <a href={`#${h.id}`} className="hover:text-accent">{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 4: Use it in the post detail page**

The detail layout becomes a 2-column grid on `lg+` (TOC + article). Adjust `src/app/(site)/blog/[slug]/page.tsx`:
```tsx
import { extractHeadings } from "@/lib/extract-headings";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { renderPostHtml } from "@/lib/blocknote/render";

…
const html = await renderPostHtml(post.contentJson);
const headings = extractHeadings(html);
…
<main lang={lang} className="px-[5vw] pt-32 pb-32 max-w-6xl mx-auto grid lg:grid-cols-[1fr_240px] gap-10">
  <div>
    {/* existing meta + h1 + excerpt + hr */}
    <article className="prose …" dangerouslySetInnerHTML={{ __html: html }} />
    <CodeBlockEnhancer />
  </div>
  <TableOfContents headings={headings} />
</main>
```
Remove the old `<PostRenderer>` usage (it would double-render).

- [ ] **Step 5: Commit.**

```bash
git add src/lib/extract-headings.ts src/lib/blocknote/render.ts src/components/blog/TableOfContents.tsx "src/app/(site)/blog/[slug]/page.tsx"
git commit -m "feat(blog): table of contents from h2/h3 with id anchors"
```

---

## Task 17: Featured cross-section on Home

**Files:**
- Create: `src/components/home/Featured.tsx`
- Modify: `src/app/(site)/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { listPublishedPosts } from "@/lib/db/posts";
import { listPhotos } from "@/lib/db/photos";
import { PostCard } from "@/components/blog/PostCard";
import { BlurredImage } from "@/components/photos/BlurredImage";
import Link from "next/link";

export async function Featured() {
  const [posts, photos] = await Promise.all([
    listPublishedPosts(),
    listPhotos(),
  ]);
  const recentPosts = posts.slice(0, 3);
  const recentPhotos = photos.slice(0, 6);

  return (
    <section className="px-[5vw] py-24 max-w-[var(--container-site)] mx-auto space-y-16">
      <div>
        <div className="flex items-baseline gap-5 mb-8">
          <span className="text-xs tracking-[.2em] text-accent">04</span>
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Recent writing</h2>
          <Link href="/blog" className="ml-auto text-sm text-muted hover:text-ink">All posts →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recentPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-5 mb-8">
          <span className="text-xs tracking-[.2em] text-accent">05</span>
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Selected photographs</h2>
          <Link href="/photos" className="ml-auto text-sm text-muted hover:text-ink">All photos →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {recentPhotos.map((p) => (
            <Link href="/photos" key={p.id} className="rounded-lg overflow-hidden">
              <BlurredImage publicId={p.cloudinaryPublicId} alt={p.caption ?? ""} width={p.width} height={p.height} blurDataUrl={p.blurDataUrl} sizes="(max-width:768px) 50vw, 33vw" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<Featured />` between Philosophy and Contact in `src/app/(site)/page.tsx`.**

- [ ] **Step 3: Commit.**

```bash
git add src/components/home/Featured.tsx src/app/(site)/page.tsx
git commit -m "feat(home): featured writing + photos cross-section"
```

---

## Task 18: Lighthouse + verification pass

- [ ] **Step 1: Build + serve**

```bash
npm run build && npm start
```

- [ ] **Step 2: Run Lighthouse on `/`, `/blog`, `/blog/<slug>`, `/photos` (mobile preset)**

Open DevTools → Lighthouse → Mobile, Categories: Performance + Accessibility + Best Practices + SEO. Run for each route.

Targets (from spec §6): Performance ≥ 90, Accessibility ≥ 90, LCP < 2.5s, CLS < 0.1, INP < 200ms.

- [ ] **Step 3: Fix the largest regression first**

Likely culprits:
- LCP > 2.5s: cover image not optimized — confirm Cloudinary URLs use `w_<reasonable>,q_auto,f_auto`; preload the hero font.
- CLS: a section without explicit dimensions — give the SkillsMarquee a `min-h-[var]`; ensure all Photo images have width/height.
- Accessibility: missing alt text — add proper alt prop to every `<Image>`; check color contrast on muted text.

Apply targeted fixes. Re-run Lighthouse.

- [ ] **Step 4: Run the full local verification one more time**

```bash
npm run lint && npm run typecheck && npm test && npx playwright test && npm run build
```
Expected: all green.

- [ ] **Step 5: Push + verify production**

```bash
git push
```
After deploy, re-run Lighthouse against the production domain. Repeat per route.

- [ ] **Step 6: Commit any fixes made.**

```bash
git add -p
git commit -m "perf: lighthouse pass to hit ≥90 across categories"
git push
```

---

## Phase 2 — Done When

- Visiting the site for the first time: three-language greeting fades in, then iris reveals the page, then the hero h1 lines lift up; second visit in the same tab skips the intro.
- The hero h1 reveals line-by-line; stats roll up; nav gains a blurred background on scroll; the marquee scrolls smoothly.
- A photo upload generates blurhash + EXIF on the server, GPS is stripped, the public gallery shows blurred placeholders before images load, clicking a photo opens a lightbox with keyboard nav + EXIF caption.
- Album filter visible on `/photos` when at least one album exists.
- `<head>` of `/blog/<slug>` contains `og:title`, `og:image` (dynamic), canonical link, and `Article` JSON-LD.
- `/sitemap.xml`, `/robots.txt`, `/feed.xml` all return valid output.
- Lighthouse (mobile, production): Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 on every public route.
- All Vitest + Playwright tests pass.

---

*End of Phase 2. Remaining "Future" items from spec §7 Phase 3 (analytics, comments, full-text search, virtual scroll for huge photo counts) are intentionally not planned here — they get their own plan when needed.*
