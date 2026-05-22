# Personal Website — Phase 0: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js project skeleton with the design system, database, auth, image pipeline, and deployment wired in — so Phase 1 can build features without plumbing.

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind CSS v4 as a single full-stack app. PostgreSQL (Supabase) accessed via Prisma. Auth.js (NextAuth v5) Credentials provider for the single-admin `/admin/*` area. Cloudinary handles image storage/transforms. Vitest + Playwright for tests. Deployed to Vercel.

**Tech Stack:** Next.js 15 · React 19 · TypeScript · Tailwind v4 · Prisma · Supabase Postgres · Auth.js v5 · Cloudinary · Vitest · React Testing Library · Playwright · Vercel

**Reference files:**
- Spec: `/Users/yuhang/Downloads/个人网站需求文档 (1).md`
- Prototype: `/Users/yuhang/Downloads/theme-prototype-light.html`

**Out of scope for Phase 0:** All page content (Home/Blog/Photos), all animations, all admin UIs. Phase 0 produces a deployed empty shell with a working `/healthz` and an `/admin/login` page that can authenticate. Real content lives in Phase 1; polish/animations in Phase 2.

---

## File Structure

```
/                              repo root (will become a git repo)
├── .env.example               documented env vars (no secrets)
├── .env.local                 local secrets (gitignored)
├── .gitignore
├── README.md                  setup + deploy instructions
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs         Tailwind v4 PostCSS plugin
├── vitest.config.ts
├── vitest.setup.ts            RTL + jest-dom matchers
├── playwright.config.ts
├── prisma/
│   ├── schema.prisma          User, Post, Tag, PostTag, Photo, Album
│   └── seed.ts                creates the single admin user
├── src/
│   ├── app/
│   │   ├── layout.tsx         RootLayout: fonts, nav skeleton, footer
│   │   ├── page.tsx           empty home placeholder
│   │   ├── globals.css        Tailwind v4 @theme tokens + base
│   │   ├── healthz/route.ts   GET → { ok: true } — smoke test
│   │   ├── admin/
│   │   │   ├── layout.tsx     auth-guarded layout
│   │   │   └── login/page.tsx login form
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── SiteNav.tsx        nav skeleton (no animations yet)
│   │   └── SiteFooter.tsx
│   ├── lib/
│   │   ├── prisma.ts          singleton PrismaClient (dev HMR safe)
│   │   ├── auth.ts            Auth.js config + helpers
│   │   └── cloudinary.ts      configured SDK + signed-upload helper
│   ├── middleware.ts          guards /admin/* (except /admin/login)
│   └── tests/
│       ├── unit/
│       │   └── prisma.test.ts smoke: client constructs
│       └── e2e/
│           └── healthz.spec.ts
└── docs/superpowers/plans/    plan docs (this file lives here)
```

Each file has one clear responsibility. The split between `lib/` (server-only helpers), `components/` (rendered React), and `app/` (routes) is the standard App Router shape.

---

## Task 1: Initialize the Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `postcss.config.mjs`

- [ ] **Step 1: Run create-next-app in the empty working directory**

Run from `/Users/yuhang/my-web`:
```bash
npx --yes create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack --use-npm --yes
```
Expected: scaffolds Next.js 15 + TS + Tailwind v4 into the current directory. If it complains about non-empty dir, accept the prompt; `docs/` is fine to keep.

- [ ] **Step 2: Initialize git**

```bash
git init
git add -A
git commit -m "chore: bootstrap next.js app via create-next-app"
```

- [ ] **Step 3: Verify the dev server boots**

```bash
npm run dev
```
Expected: server logs `Ready in <n>ms` on `http://localhost:3000`. Hit `curl -sf http://localhost:3000` and confirm a 200. Ctrl-C to stop.

- [ ] **Step 4: Commit the verified baseline**

Nothing changed; no commit needed. Move on.

---

## Task 2: Install runtime and dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install \
  @prisma/client \
  next-auth@beta @auth/prisma-adapter \
  bcryptjs \
  cloudinary \
  zod
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D \
  prisma \
  @types/bcryptjs \
  vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test \
  tsx
```

- [ ] **Step 3: Install Playwright browsers**

```bash
npx playwright install --with-deps chromium
```
Expected: downloads Chromium. (On macOS it may skip `--with-deps`; that's fine.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add prisma, auth.js, cloudinary, vitest, playwright deps"
```

---

## Task 3: Configure Tailwind v4 design tokens

**Files:**
- Modify: `src/app/globals.css`

The prototype's CSS variables become Tailwind v4 `@theme` tokens so utility classes like `bg-paper`, `text-ink`, `font-serif` work everywhere.

- [ ] **Step 1: Replace `src/app/globals.css` with the design tokens**

```css
@import "tailwindcss";

@theme {
  --color-paper: #f3ede1;
  --color-paper-2: #ece4d4;
  --color-surface: #fbf6ec;
  --color-surface-2: #fffdf6;
  --color-ink: #241e17;
  --color-muted: #796f62;
  --color-faint: #a99d8c;
  --color-accent: #9c6b3a;
  --color-line: rgba(36, 30, 23, 0.13);
  --color-line-2: rgba(36, 30, 23, 0.24);

  --font-serif: "Newsreader", Georgia, serif;
  --font-body: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;

  --container-site: 1140px;
}

@layer base {
  html { scroll-behavior: smooth; }
  body {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-body);
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--color-accent); color: #fff; }
  a { color: inherit; text-decoration: none; }
}
```

- [ ] **Step 2: Wire Google Fonts via `next/font` in the root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif-loaded",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chuck Chen — Frontend Engineer & Photographer",
  description: "A frontend engineer in Tokyo who chases good light.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Confirm `next/font` variable names match the CSS**

The `--font-serif-loaded` and `--font-body-loaded` variables emitted by `next/font` would not be picked up by the Tailwind tokens above. Adjust the `@theme` block in `globals.css` so the font tokens reference the loaded variables:
```css
  --font-serif: var(--font-serif-loaded), Georgia, serif;
  --font-body: var(--font-body-loaded), ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 4: Sanity check in browser**

```bash
npm run dev
```
Open `http://localhost:3000`, open DevTools, inspect `<body>`. Expected: `font-family` resolves to Hanken Grotesk; body background is `#f3ede1`. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: paper-theme tailwind tokens and serif/body fonts"
```

---

## Task 4: Add a `cn()` class-merge utility

**Files:**
- Create: `src/lib/cn.ts`

- [ ] **Step 1: Install clsx + tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 2: Create the helper**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/cn.ts package.json package-lock.json
git commit -m "feat: cn() class merge helper"
```

---

## Task 5: Configure Vitest with React Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (add `test` script)
- Modify: `tsconfig.json` (add vitest globals types)

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/tests/unit/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add scripts and types**

In `package.json` `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

In `tsconfig.json` `compilerOptions.types`, add `"vitest/globals"`.

- [ ] **Step 4: Write a placeholder unit test**

`src/tests/unit/sanity.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs", () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 5: Run it and confirm green**

```bash
npm test
```
Expected: `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tsconfig.json package.json src/tests
git commit -m "test: configure vitest + react testing library"
```

---

## Task 6: Configure Playwright for E2E

**Files:**
- Create: `playwright.config.ts`, `src/tests/e2e/healthz.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write the healthz e2e spec (will fail until Task 13)**

`src/tests/e2e/healthz.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("healthz returns ok", async ({ request }) => {
  const res = await request.get("/healthz");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});
```

- [ ] **Step 3: Commit (test is red, that's fine — TDD for Task 13)**

```bash
git add playwright.config.ts src/tests/e2e
git commit -m "test: playwright config and healthz e2e spec (red)"
```

---

## Task 7: Create the Supabase project + .env scaffolding

This is a manual step against the Supabase web console. Document what's needed; the engineer running this plan must do it once.

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (ensure `.env.local` is ignored — usually already is)

- [ ] **Step 1: Create the Supabase project**

In the Supabase dashboard: New Project → name `chuck-personal-site` → region `Northeast Asia (Tokyo)` → set a DB password (save it). Wait ~2 min for provisioning.

- [ ] **Step 2: Copy connection strings**

Project Settings → Database → Connection string. Copy both:
- "Transaction" pooler URL → for `DATABASE_URL` (runtime, port 6543)
- "Session" / direct URL → for `DIRECT_URL` (migrations, port 5432)

- [ ] **Step 3: Write `.env.example` (no real secrets)**

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres"

# Auth.js
AUTH_SECRET="generate with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Admin seed
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="change-me-and-do-not-commit"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```

- [ ] **Step 4: Create `.env.local` with the real values**

Copy `.env.example` → `.env.local` and fill in real values. Generate `AUTH_SECRET` with `openssl rand -base64 32`.

- [ ] **Step 5: Verify `.env.local` is gitignored**

```bash
grep -E "^\.env(\.local)?$" .gitignore || echo ".env.local" >> .gitignore
git status
```
Expected: `.env.local` not listed.

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: env scaffolding for supabase + auth + cloudinary"
```

---

## Task 8: Define the Prisma schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```
This creates `prisma/schema.prisma` and appends to `.env`. Delete the generated `.env` (we already have `.env.local`):
```bash
rm -f .env
```

- [ ] **Step 2: Replace `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Language {
  zh
  en
  ja
}

enum PostStatus {
  draft
  published
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Post {
  id             String     @id @default(cuid())
  slug           String     @unique
  title          String
  language       Language
  contentJson    Json
  contentHtml    String?    @db.Text
  excerpt        String?
  coverImageUrl  String?
  status         PostStatus @default(draft)
  publishedAt    DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  tags           PostTag[]

  @@index([status, publishedAt])
  @@index([language])
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  slug  String    @unique
  color String?
  posts PostTag[]
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
}

model Album {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  coverPhotoId String?
  order        Int      @default(0)
  createdAt    DateTime @default(now())
  photos       Photo[]
}

model Photo {
  id                 String   @id @default(cuid())
  caption            String?
  cloudinaryPublicId String   @unique
  width              Int
  height             Int
  blurhash           String?
  exif               Json?
  takenAt            DateTime?
  order              Int      @default(0)
  createdAt          DateTime @default(now())
  albumId            String?
  album              Album?   @relation(fields: [albumId], references: [id], onDelete: SetNull)

  @@index([albumId, order])
}
```

- [ ] **Step 3: Tell Prisma to read `.env.local`**

Prisma reads `.env` by default. Add a script in `package.json` to inject the right env file:
```json
"db:generate": "dotenv -e .env.local -- prisma generate",
"db:migrate": "dotenv -e .env.local -- prisma migrate dev",
"db:push": "dotenv -e .env.local -- prisma db push",
"db:studio": "dotenv -e .env.local -- prisma studio",
"db:seed": "dotenv -e .env.local -- tsx prisma/seed.ts"
```
Install dotenv-cli:
```bash
npm install -D dotenv-cli
```

- [ ] **Step 4: Run the first migration against Supabase**

```bash
npm run db:migrate -- --name init
```
Expected: connects to Supabase, creates `_prisma_migrations` table + your tables, generates the client. If it fails on `connection refused`, double-check `DIRECT_URL` uses port 5432.

- [ ] **Step 5: Verify in Supabase Table Editor**

Refresh the Supabase dashboard → Table Editor. Expected: `User`, `Post`, `Tag`, `PostTag`, `Photo`, `Album` tables visible.

- [ ] **Step 6: Commit**

```bash
git add prisma package.json package-lock.json
git commit -m "feat(db): prisma schema for users, posts, tags, photos, albums"
```

---

## Task 9: Create the Prisma client singleton + admin seed

**Files:**
- Create: `src/lib/prisma.ts`, `prisma/seed.ts`
- Create: `src/tests/unit/prisma.test.ts`

- [ ] **Step 1: Write the failing unit test**

`src/tests/unit/prisma.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("prisma client singleton", () => {
  it("exports a PrismaClient instance with $connect/$disconnect", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  it("reuses the same instance across imports (HMR-safe)", async () => {
    const a = (await import("@/lib/prisma")).prisma;
    const b = (await import("@/lib/prisma")).prisma;
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
npm test -- prisma
```
Expected: FAIL — module `@/lib/prisma` not found.

- [ ] **Step 3: Implement `src/lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Re-run the test**

```bash
npm test -- prisma
```
Expected: PASS.

- [ ] **Step 5: Write the admin seed script**

`prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
  console.log(`Seeded admin user: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 6: Run the seed**

```bash
npm run db:seed
```
Expected: `Seeded admin user: <your email>`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/prisma.ts src/tests/unit/prisma.test.ts prisma/seed.ts
git commit -m "feat(db): prisma singleton client and admin user seed"
```

---

## Task 10: Configure Auth.js v5 with Credentials provider

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts`

- [ ] **Step 1: Write `src/lib/auth.ts`**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
```

- [ ] **Step 2: Write the route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```ts
export { GET, POST } from "@/lib/auth/handlers";
```

Wait — that's wrong. Auth.js v5 exports `handlers` from the config. Use:
```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Extend the Session type**

`src/types/next-auth.d.ts`:
```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; email?: string | null; name?: string | null; image?: string | null };
  }
}
```

- [ ] **Step 4: Smoke check that auth routes mount**

```bash
npm run dev
```
Hit `curl -sf http://localhost:3000/api/auth/providers`. Expected: JSON containing `credentials`. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth src/types
git commit -m "feat(auth): auth.js credentials provider with bcrypt"
```

---

## Task 11: Guard /admin/* with middleware

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/layout.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`
- Create: `src/tests/e2e/admin-guard.spec.ts`

- [ ] **Step 1: Write the failing e2e spec**

`src/tests/e2e/admin-guard.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("unauthenticated /admin redirects to /admin/login", async ({ page }) => {
  const res = await page.goto("/admin");
  expect(page.url()).toContain("/admin/login");
  expect(res?.status()).toBeLessThan(500);
});

test("/admin/login is reachable without auth", async ({ page }) => {
  const res = await page.goto("/admin/login");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
```

- [ ] **Step 2: Run, confirm both fail**

```bash
npx playwright test admin-guard
```
Expected: both fail (no pages exist).

- [ ] **Step 3: Implement `src/middleware.ts`**

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  if (!req.auth && !isLogin) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 4: Implement the admin shell + placeholder pages**

`src/app/admin/layout.tsx`:
```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>;
}
```

`src/app/admin/page.tsx`:
```tsx
import { auth } from "@/lib/auth";

export default async function AdminHome() {
  const session = await auth();
  return (
    <div>
      <h1 className="font-serif text-3xl">Admin</h1>
      <p className="mt-4 text-muted">Signed in as {session?.user?.email}</p>
    </div>
  );
}
```

`src/app/admin/login/page.tsx`:
```tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const from = useSearchParams().get("from") ?? "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid email or password");
    else window.location.href = from;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="font-serif text-3xl">Sign in</h1>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" className="block w-full border border-line p-3 rounded"
      />
      <input
        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="Password" className="block w-full border border-line p-3 rounded"
      />
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button className="px-6 py-3 bg-ink text-paper rounded-full">Sign in</button>
    </form>
  );
}
```

Wrap the login page in a SessionProvider — for v5, client-side `signIn` works without a provider as long as `/api/auth/[...nextauth]` is mounted.

- [ ] **Step 5: Re-run the e2e**

```bash
npx playwright test admin-guard
```
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts src/app/admin src/tests/e2e/admin-guard.spec.ts
git commit -m "feat(auth): middleware guard for /admin + login page"
```

---

## Task 12: Cloudinary helper

**Files:**
- Create: `src/lib/cloudinary.ts`
- Create: `src/tests/unit/cloudinary.test.ts`

- [ ] **Step 1: Write the failing test**

`src/tests/unit/cloudinary.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("cloudinary helper", () => {
  beforeEach(() => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    vi.resetModules();
  });

  it("buildSignedUploadParams returns timestamp + signature + apiKey", async () => {
    const { buildSignedUploadParams } = await import("@/lib/cloudinary");
    const params = buildSignedUploadParams({ folder: "photos" });
    expect(params).toHaveProperty("timestamp");
    expect(params).toHaveProperty("signature");
    expect(params).toHaveProperty("apiKey", "key");
    expect(params).toHaveProperty("cloudName", "demo");
    expect(params).toHaveProperty("folder", "photos");
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

```bash
npm test -- cloudinary
```
Expected: module not found.

- [ ] **Step 3: Implement `src/lib/cloudinary.ts`**

```ts
import { v2 as cloudinary } from "cloudinary";

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function buildSignedUploadParams(opts: { folder: string }) {
  const c = configure();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = c.utils.api_sign_request(
    { timestamp, folder: opts.folder },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: opts.folder,
  };
}

export { cloudinary };
```

- [ ] **Step 4: Re-run test**

```bash
npm test -- cloudinary
```
Expected: PASS.

- [ ] **Step 5: Configure `next.config.ts` to allow Cloudinary image domain**

Replace `next.config.ts`:
```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default config;
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/cloudinary.ts src/tests/unit/cloudinary.test.ts next.config.ts
git commit -m "feat(images): cloudinary sdk + signed upload helper"
```

---

## Task 13: Health check route + smoke E2E green

**Files:**
- Create: `src/app/healthz/route.ts`

- [ ] **Step 1: Implement the route**

`src/app/healthz/route.ts`:
```ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Run the healthz e2e from Task 6**

```bash
npx playwright test healthz
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/healthz
git commit -m "feat: healthz endpoint for uptime checks"
```

---

## Task 14: Site nav skeleton + footer + empty home

**Files:**
- Create: `src/components/SiteNav.tsx`, `src/components/SiteFooter.tsx`
- Modify: `src/app/layout.tsx` (mount nav + footer)
- Modify: `src/app/page.tsx` (placeholder)

These are skeletons — the real, content-rich Home lives in Phase 1. Phase 0 just wires the layout chrome so URLs work.

- [ ] **Step 1: `src/components/SiteNav.tsx`**

```tsx
import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] py-6">
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

- [ ] **Step 2: `src/components/SiteFooter.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line px-[5vw] py-8 text-xs text-faint flex justify-between">
      <span>© {new Date().getFullYear()} Chuck Chen</span>
      <span>Built with Next.js · Tokyo</span>
    </footer>
  );
}
```

- [ ] **Step 3: Update `src/app/layout.tsx` to mount them (skip on /admin)**

Wrap children with the nav/footer only outside `/admin`. Simplest: mount them in `src/app/(site)/layout.tsx` and move `page.tsx` etc. into a route group. Restructure:

Create `src/app/(site)/layout.tsx`:
```tsx
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  );
}
```

Move `src/app/page.tsx` to `src/app/(site)/page.tsx`. Keep `src/app/layout.tsx` minimal (the one from Task 3).

- [ ] **Step 4: Placeholder `src/app/(site)/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[var(--container-site)] px-[5vw] pt-40">
      <h1 className="font-serif text-5xl">Coming soon.</h1>
      <p className="mt-4 text-muted">Phase 0 shell. Phase 1 fills this in.</p>
    </main>
  );
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```
Visit `/`, `/admin/login`, `/healthz`. Expected: home renders with nav/footer; admin login renders without site chrome; healthz returns JSON. Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components
git commit -m "feat: site nav + footer skeleton, route-group split for /admin"
```

---

## Task 15: Pre-commit `npm run lint` + typecheck script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add typecheck script**

In `package.json` `scripts`:
```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 2: Run lint + typecheck + tests + e2e**

```bash
npm run lint && npm run typecheck && npm test && npx playwright test
```
Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: typecheck script and full local verification"
```

---

## Task 16: Deploy to Vercel + set env vars

This is largely a console exercise. Document but don't automate.

**Files:**
- Modify: `README.md` (add deploy section)

- [ ] **Step 1: Push to GitHub**

Create a new private GitHub repo (web UI), then:
```bash
git remote add origin git@github.com:<you>/chuck-personal-site.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Import on Vercel**

Vercel dashboard → Add New → Project → Import the GitHub repo. Framework auto-detects Next.js.

- [ ] **Step 3: Set environment variables in Vercel**

Copy every var from `.env.local` (DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL — set this to your Vercel preview/prod URL, ADMIN_EMAIL, ADMIN_PASSWORD, all Cloudinary). Mark them for Production + Preview.

- [ ] **Step 4: First deploy**

Vercel deploys automatically on push. Wait for green. Visit `<your-vercel-url>/healthz`. Expected: `{ "ok": true }`.

- [ ] **Step 5: Seed the admin user on production**

From local, point seed at production DB temporarily by exporting `DATABASE_URL`/`DIRECT_URL` from Vercel env, then:
```bash
DATABASE_URL="<prod>" DIRECT_URL="<prod>" ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npx tsx prisma/seed.ts
```
Expected: `Seeded admin user`.

- [ ] **Step 6: Update README with the deploy URL and a setup checklist**

`README.md`:
```md
# chuck-personal-site

Next.js 15 + Prisma + Supabase + Cloudinary + Auth.js.

## Local dev

1. `cp .env.example .env.local` and fill it in.
2. `npm install`
3. `npm run db:migrate` — apply Prisma migrations.
4. `npm run db:seed` — create the admin user.
5. `npm run dev`

## Tests

- `npm test` — unit (Vitest)
- `npm run test:e2e` — Playwright

## Deploy

Vercel: env vars must include DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD, CLOUDINARY_* and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.
After deploy, run the seed script against the production DB once.
```

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "docs: setup, test, and deploy instructions"
git push
```

---

## Task 17: Domain (manual, document only)

- [ ] **Step 1: Pick a domain via your registrar of choice (Namecheap / Cloudflare / Porkbun).**

Some candidates: `chuckchen.dev`, `chuckchen.photo`, `chuck.tokyo`. Buy one.

- [ ] **Step 2: Add the domain in Vercel → Project → Settings → Domains.**

Follow Vercel's DNS instructions (A record or CNAME). Wait for verification.

- [ ] **Step 3: Update `AUTH_URL` in Vercel env to the final HTTPS domain, redeploy.**

This is required so Auth.js generates correct callback URLs.

- [ ] **Step 4: No commit needed unless README is updated with the live URL.**

---

## Phase 0 — Done When

- `npm run lint && npm run typecheck && npm test && npx playwright test` all pass locally.
- `https://<domain>/healthz` returns `{ "ok": true }` in production.
- `https://<domain>/admin/login` accepts your seeded credentials and lands on `/admin`.
- Prisma migrations + admin seed have been run against the production DB.
- Cloudinary credentials are configured (verified by passing unit test).

## Phase 0 — Not Done (handed to Phase 1)

- Home page content (hero, about, experience, skills, philosophy, contact)
- Blog list/detail, blog admin, BlockNote editor
- Photos gallery, photo upload, EXIF extraction
- Any animations beyond Tailwind default transitions
- SEO metadata beyond the default title

---

*Move on to `2026-05-21-phase-1-mvp.md`.*
