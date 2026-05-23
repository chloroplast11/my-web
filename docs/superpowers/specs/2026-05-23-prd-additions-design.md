# PRD Additions — Phase 2 Polish Requirements

> Date: 2026-05-23
> Parent spec: [docs/SPECS.md](../../SPECS.md) (PRD v0.3 → v0.4)
> Status: Approved during brainstorming, pending user review of inline PRD edits.

Seven requirements raised by the owner are folded into the existing PRD. This document captures the decisions and rationale; the PRD itself (`docs/SPECS.md`) is the authoritative requirements source and is updated inline.

---

## Items added

### 1. Lightbox shows album name

The photo lightbox header displays the album name the photo belongs to (and the caption, if present) above the image. If a photo is not in any album, the album field is omitted. Applies to:

- `/photos` gallery lightbox
- Home page Featured photos lightbox (same component)

PRD section: §4.3.1.

### 2. Admin-controlled Featured strip on Home

The Featured section on the Home page (recent blogs + photos cross-section) becomes admin-configurable. The owner can pin specific posts and photos, reorder them, and hide individual entries — replacing the current "latest N" auto-pull.

**Data model:** one new `Featured` table:

| field | type | notes |
|---|---|---|
| id | string | pk |
| kind | enum(`post`, `photo`) | which library it points at |
| refId | string | fk to `Post.id` or `Photo.id` |
| order | int | sort within its kind |
| isVisible | bool | toggle without deleting |

`Post` and `Photo` themselves are unchanged.

**Admin UI:** new route `/admin/featured`. Two side-by-side panels (Posts | Photos). Each panel is a drag-to-reorder list with a visibility toggle per row and an "Add from library" picker. Saves take effect immediately (no draft/publish split).

**Out of scope:** scheduling, A/B variants, per-locale featured lists.

PRD sections: §4.1 (Featured item), §4.2.2 (admin routes), §5 (data model).

### 3. Confirm before delete

Every destructive admin action shows a confirmation dialog before executing. Covers: delete post, delete tag, delete photo, delete album, remove from Featured (if "delete" rather than "hide").

**Shared component:** a single `<ConfirmDialog>` used by every admin delete button. Body text: `Delete "<title>"? This cannot be undone.` Buttons: Cancel (default) / Delete (destructive style, accent red — not the warm `#9c6b3a` accent, a distinct danger color to be picked in implementation).

**Not included:** type-the-name-to-confirm friction. Single-admin site, dialog is sufficient.

PRD sections: §4.2.2, §4.3.2, §6 (NFR — UX safety).

### 4. `cursor: pointer` on clickable images

Every clickable image (Featured cards, blog list covers, photo thumbnails, inline blog images once #7 ships) renders with `cursor: pointer`. Currently inconsistent. This is purely about the cursor — existing hover treatments (EXIF overlay on photo thumbnails, etc.) are unchanged.

PRD section: §1.4 (visual & motion rules).

### 5. Top loading progress bar

A thin (2px) accent-colored progress bar at the very top of the viewport during slow route transitions.

**Behavior:**
- Hooks into Next.js App Router navigation events.
- Only appears if the transition exceeds ~150ms — fast navigations don't flash.
- Color: accent `#9c6b3a`.
- Implemented as a small client component, not the `nprogress` npm package (avoid the dep).
- Respects `prefers-reduced-motion` by skipping the slide-in/out animation and just fading.

PRD sections: §1.4, §6 (NFR).

### 6. Site-wide container / gutter token

Define one container token used by every page section:

- `max-width: 72rem` (final value to be tuned against existing layout)
- horizontal padding: `clamp(1rem, 5vw, 2rem)`

Single `<Container>` wrapper component (or Tailwind utility) used by every page section so the left/right edges line up across the site.

**Two known offenders to fix as part of this work:**
- `/admin/posts` — content currently shifted to the right, container not centered.
- Home → Experience section — the "02" section-number label sits left of the column, misaligning with the row content below.

**Forward-looking rule:** any new section/page introduced after this PR uses the `<Container>` wrapper. Drift gets caught in code review.

PRD section: §1.4.

### 7. Click-to-zoom for inline blog images

Inline `<img>` elements inside rendered blog articles open the existing photo lightbox on click. Reuses the same lightbox component.

**Implementation:** done in the blog renderer (the component that turns BlockNote JSON / HTML into final markup), so post authors don't need to mark images up specially.

**Differences from photo lightbox:**
- No EXIF strip (blog images don't carry EXIF).
- No album name (blog images aren't in albums).
- Caption falls back to the image's `alt` text if present.

PRD section: §4.2.1.

---

## Design decisions log

| # | Decision | Why |
|---|---|---|
| D1 | Featured uses a single `Featured` table (kind + refId), not separate `FeaturedPost`/`FeaturedPhoto` tables | Less duplication, easy to extend if a third "kind" appears |
| D2 | Featured saves are immediate, no draft/publish | Single-admin site, no need for two-stage workflow |
| D3 | Confirm dialog is simple Cancel/Delete, no type-to-confirm | Friction not warranted for single-admin |
| D4 | Progress bar is custom, not `nprogress` dependency | Avoids dep for ~30 lines of code; keeps bundle lean |
| D5 | 150ms threshold for progress bar | Fast nav (<150ms) feels instant; bar would just flash |
| D6 | One `<Container>` wrapper, not per-page padding utilities | Forces consistency by construction, not by review discipline |
| D7 | Blog inline images use the photo lightbox component, not a separate one | One lightbox to maintain; behavior diverges via props (hide EXIF, hide album) |

---

## Out of scope (explicitly)

- Editing Hero text/photo from admin (only Featured is admin-configurable — Hero stays in code).
- Per-image custom hover effects beyond cursor.
- Page-transition animations (only the progress bar).
- Mobile-specific lightbox tweaks for blog images.
- Replacing the existing EXIF overlay behavior on photo thumbnails.

---

## Affected files (rough)

- `docs/SPECS.md` — inline PRD updates (this PR).
- `prisma/schema.prisma` — add `Featured` model.
- `src/app/admin/featured/` — new admin route.
- `src/app/admin/posts/` — add confirm dialog on delete; fix container padding.
- `src/app/admin/photos/` — add confirm dialog on delete.
- `src/app/admin/tags/` — add confirm dialog on delete.
- Shared `<ConfirmDialog>`, `<Container>`, `<TopProgressBar>` components — new.
- Photo lightbox component — add album name slot, accept blog-image variant.
- Blog renderer — wrap inline `<img>` with lightbox trigger.
- Home Experience section — switch to `<Container>`, fix "02" alignment.
- Global CSS / Tailwind config — `cursor: pointer` on `img[role="button"]` (or equivalent class), container token.

---

## Next step

Implementation plan to be drafted via the `writing-plans` skill after the user reviews the PRD edits.
