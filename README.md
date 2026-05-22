# chuck-personal-site

Personal site for Chuck Chen — frontend engineer & photographer in Tokyo. Editorial paper theme, blog, photo gallery.

Production: <set Vercel URL or custom domain here>

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- **Database:** Supabase Postgres + Prisma 7 (with `@prisma/adapter-pg`)
- **Auth:** Auth.js v5 (Credentials provider, JWT session, bcrypt)
- **Images:** Cloudinary (signed browser-direct upload)
- **Tests:** Vitest + React Testing Library (unit) · Playwright (e2e)
- **Deploy:** Vercel

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 — Foundation | Project scaffold, design tokens, DB schema, auth, healthz, deploy | ✅ Done |
| 1 — MVP | Home content, Blog (list/detail/admin), Photos (upload/grid) | Not started |
| 2 — Polish | Intro animation, blurhash, EXIF, Lightbox, OG images, sitemap, RSS, JSON-LD | Not started |

Phase plans live in [`docs/superpowers/plans/`](docs/superpowers/plans/).

## Local development

Prereqs: Node 20+, npm. A Supabase project and a Cloudinary account.

```bash
cp .env.example .env.local       # then fill in real values
npm install                      # runs `prisma generate` via postinstall
npm run db:migrate               # apply Prisma migrations to Supabase
npm run db:seed                  # create the admin user
npm run dev                      # http://localhost:3000
```

### Required env vars

See [`.env.example`](.env.example). Summary:

- `DATABASE_URL` — Supabase **transaction pooler** URL (port 6543, runtime)
- `DIRECT_URL` — Supabase **direct/session** URL (port 5432, for migrations)
- `AUTH_SECRET` — generate via `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` locally, the deployed URL in Vercel
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — credentials seeded into the `User` table
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — server-side signing
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — same cloud name, exposed to the browser for upload URLs

URL-encode special characters in passwords (`@` → `%40`, etc.) inside the connection strings.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm run start        # serve the production build

npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest (unit)
npm run test:e2e     # Playwright (e2e)

npm run db:migrate   # prisma migrate dev (uses .env.local)
npm run db:seed      # seed admin user
npm run db:studio    # open Prisma Studio
npm run db:push      # push schema without migration (rarely)
npm run db:generate  # regenerate the Prisma client
```

## Project structure

```
prisma/
  schema.prisma           User, Post, Tag, PostTag, Album, Photo (+ Language, PostStatus enums)
  seed.ts                 admin upsert via bcrypt
  migrations/             generated SQL
prisma.config.ts          Prisma 7 datasource config (DIRECT_URL for CLI)

src/
  app/
    (site)/               public route group: nav + footer + home placeholder
    admin/                admin dashboard + login (guarded by src/proxy.ts)
    api/auth/[...nextauth]/route.ts   Auth.js handlers
    healthz/route.ts      uptime probe → { ok: true }
    layout.tsx            root layout (next/font wires --font-serif-loaded, --font-body-loaded)
    globals.css           Tailwind v4 @theme tokens (paper palette + fonts)
  components/             SiteNav, SiteFooter
  lib/
    auth.ts               Auth.js v5 config (Credentials + JWT)
    prisma.ts             singleton client via PrismaPg(Pool)
    cloudinary.ts         buildSignedUploadParams()
    cn.ts                 clsx + tailwind-merge helper
  proxy.ts                Next 16 middleware: guards /admin/*, redirects to /admin/login
  tests/
    unit/                 Vitest specs
    e2e/                  Playwright specs
  types/next-auth.d.ts    Session.user.id augmentation
```

## Deploy

Vercel autodetects Next.js. Required setup:

1. Push to GitHub, import the repo on Vercel.
2. Add every var from `.env.local` to **Project Settings → Environment Variables** (Production + Preview).
3. Set `AUTH_URL` to the deployed URL (e.g. `https://chuck-personal-site.vercel.app`).
4. Deploy. `postinstall` runs `prisma generate`; build runs typecheck + Next build.
5. Visit `<url>/healthz` → expect `{"ok":true}`.
6. Visit `<url>/admin/login` → sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

The same Supabase project is used for local and prod (single DB), so the admin user seeded locally is the prod admin user.

## Notes

- **Next 16 rename:** `src/proxy.ts` (not `src/middleware.ts`) is the supported filename for edge middleware.
- **Prisma 7:** the datasource `url` lives in `prisma.config.ts`, not `schema.prisma`. The runtime client uses the Pool/Adapter pattern with `DATABASE_URL` (pooler).
- `.env.local` is gitignored (`.env*` + `!.env.example`).
