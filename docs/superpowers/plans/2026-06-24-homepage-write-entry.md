# 主页写作入口 + 左右排版写作页 · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 主页为 admin 加一个"写文章"入口卡，写作页改为左右排版，从主页保存后跳转到 admin-only 草稿预览页。

**Architecture:** 新增 `"write"` cardId 到 bento 系统；新增 `WriteCard` 组件 + 条件渲染；`PostMetaForm` 改造为 2-pane grid，三个入口（`/write`、`/admin/posts/new`、`/admin/posts/[id]/edit`）共用；`createPost` 增加 `redirectTo` 参数；新增 `/write` 路由 + `/preview/[slug]` admin-only 预览路由 + `getAdminPostBySlug` 数据函数。

**Tech Stack:** Next.js 15 App Router、React Server Components、Prisma、BlockNote、Tailwind、framer-motion、vitest、Playwright。

## Global Constraints

- 所有新路由所属 group：`(site)` route group（不引入 admin layout chrome）。
- 任何 admin-only 路由的鉴权：`auth()` 取 session，非 admin 走 `redirect("/")` 或 `notFound()`。
- bento 卡 IDs 单一来源：`src/lib/bento-defaults.ts` 的 `CARD_IDS` —— 增改卡片必须同步 `CARD_IDS` / `BENTO_DEFAULTS` / `layoutReadSchema` / `layoutWriteSchema` 四处。
- 任何对 `PostMetaForm` 字段集的改动需保持 `createPost` / `updatePost` 的 `PostInput` schema 不变（仅 UI 改造）。
- 不引入新依赖。

---

## File Structure

### Create

- `src/components/home/bento/cards/WriteCard.tsx` —— 主页 admin 入口卡片，纯 nav。
- `src/app/(site)/write/page.tsx` —— admin-only 新建草稿入口。
- `src/app/(site)/preview/[slug]/page.tsx` —— admin-only 预览页（支持 draft + published）。
- `src/tests/unit/write-card.test.tsx` —— `WriteCard` 单元测试。
- `src/tests/unit/post-meta-form.test.tsx` —— `PostMetaForm` 左右排版结构测试。
- `src/tests/unit/get-admin-post-by-slug.test.ts` —— DB 函数集成测试（真 Prisma）。
- `src/tests/e2e/admin-write-flow.spec.ts` —— admin 主页入口 → 写文章 → 预览 端到端测试。

### Modify

- `src/lib/bento-defaults.ts` —— `CARD_IDS` / `BENTO_DEFAULTS` / 两个 schema 加 `"write"`。
- `src/lib/db/posts.ts` —— 新增 `getAdminPostBySlug`。
- `src/app/admin/_actions/posts.ts` —— `createPost` 增加 `options.redirectTo`。
- `src/components/admin/PostMetaForm.tsx` —— 上下排版改为 2-pane grid。
- `src/app/(site)/page.tsx` —— `{isAdmin && <WriteCard enterIndex={9} />}`。
- `src/tests/unit/merge-layout.test.ts` —— 加 `"write"` 的 hydration 用例。

---

## Task 1: 把 "write" cardId 加入 bento 系统

**Files:**
- Modify: `src/lib/bento-defaults.ts`
- Modify: `src/tests/unit/merge-layout.test.ts`

**Interfaces:**
- Consumes: 无前置 task。
- Produces: `CardId` 类型新增 `"write"` 字面量；`BENTO_DEFAULTS.write: { x: 690, y: 340, w: 120, h: 56, minW: 100, minH: 48 }`；`layoutReadSchema` / `layoutWriteSchema` 含 `write` optional 字段。

- [ ] **Step 1: 写失败的测试**

在 `src/tests/unit/merge-layout.test.ts` 末尾、`describe` 闭合前追加：

```ts
  it("includes 'write' in the merged layout with defaults when input is empty", () => {
    const out = mergeLayout({});
    expect(out.write).toEqual({
      x: BENTO_DEFAULTS.write.x,
      y: BENTO_DEFAULTS.write.y,
      w: BENTO_DEFAULTS.write.w,
      h: BENTO_DEFAULTS.write.h,
    });
  });

  it("preserves a fully-specified write entry as-is", () => {
    const out = mergeLayout({ write: { x: 100, y: 200, w: 140, h: 60 } });
    expect(out.write).toEqual({ x: 100, y: 200, w: 140, h: 60 });
  });
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx vitest run src/tests/unit/merge-layout.test.ts
```

Expected: 上面两条新用例 FAIL，因为 `BENTO_DEFAULTS.write` 不存在、`write` 不是合法的 layout key。

- [ ] **Step 3: 在 `bento-defaults.ts` 加 `"write"`**

在 `CARD_IDS` 数组末尾追加：

```ts
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
  "write",
] as const;
```

在 `BENTO_DEFAULTS` 对象内追加：

```ts
  write:          { x: 690, y: 340, w: 120, h:  56, minW: 100, minH:  48 },
```

在 `layoutReadSchema` 与 `layoutWriteSchema` 内追加（与现有字段同风格）：

```ts
  write: cardBoxReadSchema.optional(),
```

```ts
  write: cardBoxWriteSchema.optional(),
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx vitest run src/tests/unit/merge-layout.test.ts
```

Expected: 所有用例 PASS（包括既有 5 条 + 新增 2 条）。

- [ ] **Step 5: 跑 lint + 类型检查兜底**

```bash
npx tsc --noEmit
```

Expected: 无报错。如有报错通常是某个使用了 `CardId` 的 `switch / Record` 没覆盖 `"write"`；按报错点补全即可（多半无影响，因为现有代码用 `BENTO_DEFAULTS[cardId]` 索引访问）。

- [ ] **Step 6: 提交**

```bash
git add src/lib/bento-defaults.ts src/tests/unit/merge-layout.test.ts
git commit -m "feat(bento): add 'write' cardId with defaults and schema"
```

---

## Task 2: 新建 WriteCard 组件

**Files:**
- Create: `src/components/home/bento/cards/WriteCard.tsx`
- Create: `src/tests/unit/write-card.test.tsx`

**Interfaces:**
- Consumes: `BENTO_DEFAULTS.write`（Task 1）、`CardFrame`（已有）。
- Produces: `WriteCard({ enterIndex: number }): JSX.Element` —— 一个包裹 `<Link href="/write">` 的 bento card。

- [ ] **Step 1: 写失败的测试**

新建 `src/tests/unit/write-card.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WriteCard } from "@/components/home/bento/cards/WriteCard";

describe("WriteCard", () => {
  it("renders an internal link to /write", () => {
    render(<WriteCard enterIndex={9} />);
    const link = screen.getByRole("link", { name: /write/i });
    expect(link).toHaveAttribute("href", "/write");
  });

  it("renders the 'write' label", () => {
    render(<WriteCard enterIndex={9} />);
    expect(screen.getByText(/^write$/i)).toBeInTheDocument();
  });

  it("renders a decorative pen icon (svg)", () => {
    const { container } = render(<WriteCard enterIndex={9} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx vitest run src/tests/unit/write-card.test.tsx
```

Expected: FAIL（文件不存在）。

- [ ] **Step 3: 写实现**

新建 `src/components/home/bento/cards/WriteCard.tsx`：

```tsx
import Link from "next/link";
import { CardFrame } from "../CardFrame";

export function WriteCard({ enterIndex }: { enterIndex: number }) {
  return (
    <CardFrame
      cardId="write"
      finalRotation={0}
      enterIndex={enterIndex}
      className="max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-auto max-md:!h-auto max-md:self-center max-md:order-6"
    >
      <Link
        href="/write"
        aria-label="write a new post"
        className="group flex h-full w-full items-center justify-center gap-2 rounded-lg border border-line-2 bg-surface shadow-[0_4px_10px_rgba(36,30,23,0.12)] transition-transform duration-200 hover:scale-[1.03] max-md:px-6 max-md:py-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-accent xl:h-4 xl:w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
        <span className="font-serif text-[11px] italic leading-none text-ink transition-colors group-hover:text-accent xl:text-[13px] 2xl:text-[14px]">
          write
        </span>
      </Link>
    </CardFrame>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx vitest run src/tests/unit/write-card.test.tsx
```

Expected: 3 个用例 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/home/bento/cards/WriteCard.tsx src/tests/unit/write-card.test.tsx
git commit -m "feat(bento): add WriteCard admin nav card"
```

---

## Task 3: 主页条件渲染 WriteCard

**Files:**
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `WriteCard`（Task 2）、`isAdmin` 已有的 boolean。
- Produces: 主页 admin 视角下 `WriteCard` 作为 `enterIndex=9` 最后一张入场。

- [ ] **Step 1: 修改主页**

打开 `src/app/(site)/page.tsx`，在 import 区加：

```tsx
import { WriteCard } from "@/components/home/bento/cards/WriteCard";
```

在 `<EditableBento>` 内部、`<LikesCard … />` 之后插入：

```tsx
{isAdmin && <WriteCard enterIndex={9} />}
```

- [ ] **Step 2: 手动验证（admin / 非 admin）**

```bash
npm run dev
```

打开浏览器：
- 未登录访问 `http://localhost:3000/` —— 不应看到 write 卡。
- 登录 admin（`/admin/login`）后回到 `/` —— 看到右下方 `[✎ write]` 小卡，点击跳转 `/write`（页面尚未实现，应 404 —— Task 6 解决）。

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无报错。

- [ ] **Step 4: 提交**

```bash
git add src/app/(site)/page.tsx
git commit -m "feat(home): render WriteCard on homepage for admin"
```

---

## Task 4: 数据层 `getAdminPostBySlug`

**Files:**
- Modify: `src/lib/db/posts.ts`
- Create: `src/tests/unit/get-admin-post-by-slug.test.ts`

**Interfaces:**
- Consumes: 已有 Prisma client。
- Produces: `getAdminPostBySlug(slug: string)` —— 返回 `Post & { tags: ... }`（与 `getPublishedPostBySlug` 同形），但不过滤 `status`。slug 不存在返回 `null`。

- [ ] **Step 1: 写失败的测试**

新建 `src/tests/unit/get-admin-post-by-slug.test.ts`：

```ts
import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getAdminPostBySlug } from "@/lib/db/posts";

describe("getAdminPostBySlug", () => {
  const slugs: string[] = [];

  afterEach(async () => {
    if (slugs.length) {
      await prisma.post.deleteMany({ where: { slug: { in: slugs } } });
      slugs.length = 0;
    }
  });

  it("returns a draft post by slug", async () => {
    const slug = `t-draft-${Date.now()}`;
    slugs.push(slug);
    await prisma.post.create({
      data: {
        title: "Draft Title", slug, language: "en",
        contentJson: {}, contentHtml: "", status: "draft",
      },
    });
    const out = await getAdminPostBySlug(slug);
    expect(out?.slug).toBe(slug);
    expect(out?.status).toBe("draft");
  });

  it("returns a published post by slug", async () => {
    const slug = `t-pub-${Date.now()}`;
    slugs.push(slug);
    await prisma.post.create({
      data: {
        title: "Pub Title", slug, language: "en",
        contentJson: {}, contentHtml: "", status: "published",
        publishedAt: new Date(),
      },
    });
    const out = await getAdminPostBySlug(slug);
    expect(out?.slug).toBe(slug);
    expect(out?.status).toBe("published");
  });

  it("returns null when no post matches", async () => {
    const out = await getAdminPostBySlug(`missing-${Date.now()}`);
    expect(out).toBeNull();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx vitest run src/tests/unit/get-admin-post-by-slug.test.ts
```

Expected: FAIL（函数未导出）。

- [ ] **Step 3: 实现 `getAdminPostBySlug`**

在 `src/lib/db/posts.ts` 末尾追加：

```ts
export async function getAdminPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  });
}
```

- [ ] **Step 4: 跑测试确认通过**

```bash
npx vitest run src/tests/unit/get-admin-post-by-slug.test.ts
```

Expected: 3 个用例 PASS。需要本地有 `.env.local` 指向真实 dev DB（沿用现有 `featured-db.test.ts` 模式）。

- [ ] **Step 5: 提交**

```bash
git add src/lib/db/posts.ts src/tests/unit/get-admin-post-by-slug.test.ts
git commit -m "feat(db): add getAdminPostBySlug (returns drafts too)"
```

---

## Task 5: `createPost` 增加 `redirectTo` 选项

**Files:**
- Modify: `src/app/admin/_actions/posts.ts`

**Interfaces:**
- Consumes: 已有 `createPost`。
- Produces: `createPost(input, options?: { redirectTo?: "admin" | "preview" })` —— 当 `redirectTo === "preview"` 时 `redirect("/preview/" + post.slug)`，否则维持现有 `redirect("/admin/posts/" + id + "/edit")`。

测试策略：server action 用 `redirect()`（Next.js 内部 throw），加 mock 验证较繁琐且和 admin posts 的现有 e2e 套件已经覆盖回归路径。本任务采用"实现 + 既有 admin e2e 回归"策略，不写 mock unit test；新增的 `/write` flow 走 Task 7 的 e2e 验证。

- [ ] **Step 1: 修改 `createPost` 签名 + 行为**

打开 `src/app/admin/_actions/posts.ts`，把 `createPost` 改为：

```ts
export async function createPost(
  input: z.infer<typeof PostInput>,
  options?: { redirectTo?: "admin" | "preview" },
) {
  await requireAdmin();
  const data = PostInput.parse(input);
  const contentHtml = await renderPostHtml(data.contentJson);
  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug || slugify(data.title),
      language: data.language,
      excerpt: data.excerpt ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      contentJson: data.contentJson as object,
      contentHtml,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  });
  revalidatePath("/admin/posts");
  if (options?.redirectTo === "preview") {
    redirect(`/preview/${post.slug}`);
  }
  redirect(`/admin/posts/${post.id}/edit`);
}
```

- [ ] **Step 2: 跑现有 admin e2e 回归**

```bash
npx playwright test src/tests/e2e/admin-post-crud.spec.ts
```

Expected: 现有 admin 新建/发布流程全部 PASS（未传 `options` 时维持原跳转）。

- [ ] **Step 3: 提交**

```bash
git add src/app/admin/_actions/posts.ts
git commit -m "feat(admin): createPost accepts options.redirectTo"
```

---

## Task 6: `PostMetaForm` 左右排版改造

**Files:**
- Modify: `src/components/admin/PostMetaForm.tsx`
- Create: `src/tests/unit/post-meta-form.test.tsx`

**Interfaces:**
- Consumes: 已有 `slugify`、`TagPicker`、动态导入的 `PostEditor`。
- Produces: `PostMetaForm` 同名同 props (`initial`, `allTags`, `onSubmit`, `submitLabel`)，对外 onSubmit 数据形状不变。视觉变为左右两栏，仅 UI 改造。

- [ ] **Step 1: 写失败的测试**

新建 `src/tests/unit/post-meta-form.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostMetaForm } from "@/components/admin/PostMetaForm";

const initial = {
  title: "Hello",
  slug: "hello",
  language: "en" as const,
  excerpt: "",
  coverImageUrl: "",
  contentJson: undefined,
  tagIds: [],
};

describe("PostMetaForm layout", () => {
  it("renders title and slug inputs in the left pane (data-pane='left')", () => {
    const { container } = render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Save" />,
    );
    const left = container.querySelector('[data-pane="left"]');
    expect(left).not.toBeNull();
    expect(left?.querySelector('input[name="title"]')).not.toBeNull();
    expect(left?.querySelector('input[name="slug"]')).not.toBeNull();
  });

  it("renders excerpt, tags, cover, language, and submit in the right pane (data-pane='right')", () => {
    const { container } = render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Save" />,
    );
    const right = container.querySelector('[data-pane="right"]');
    expect(right).not.toBeNull();
    expect(right?.querySelector('textarea[name="excerpt"]')).not.toBeNull();
    expect(right?.querySelector('input[name="coverImageUrl"]')).not.toBeNull();
    expect(right?.querySelector('select[name="language"]')).not.toBeNull();
    expect(right?.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it("renders the submit button with the provided label", () => {
    render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Create draft" />,
    );
    expect(screen.getByRole("button", { name: /create draft/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
npx vitest run src/tests/unit/post-meta-form.test.tsx
```

Expected: 前两条 FAIL（没有 `data-pane` marker、字段也没 `name` 属性）。第三条可能 PASS。

- [ ] **Step 3: 重写 `PostMetaForm` 的 JSX**

打开 `src/components/admin/PostMetaForm.tsx`，替换 `return ( … )` 的内容：

```tsx
return (
  <form
    onSubmit={(e) => { e.preventDefault(); startTransition(() => { void onSubmit(value); }); }}
    className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-start"
  >
    {/* LEFT PANE: title, slug, editor */}
    <div data-pane="left" className="min-w-0 space-y-4">
      <div className="sticky top-0 z-10 -mx-1 bg-paper px-1 pb-3 border-b border-line">
        <input
          name="title"
          value={value.title}
          onChange={(e) => {
            const t = e.target.value;
            setValue((s) => ({ ...s, title: t, slug: s.slug || slugify(t) }));
          }}
          placeholder="Untitled"
          aria-label="Title"
          className="block w-full bg-transparent border-none p-0 font-serif text-3xl xl:text-4xl text-ink outline-none placeholder:text-line-2"
          required
        />
        <div className="mt-2 flex items-baseline gap-1 font-mono text-xs text-muted">
          <span>/blog/</span>
          <input
            name="slug"
            value={value.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            aria-label="Slug"
            className="flex-1 bg-transparent border-none border-b border-dashed border-line-2 p-1 text-ink outline-none"
            required
          />
        </div>
      </div>
      <div className="border border-line rounded p-2 min-h-[460px]">
        <PostEditor initialContent={value.contentJson} onChange={(c) => update("contentJson", c)} />
      </div>
    </div>

    {/* RIGHT PANE: excerpt, tags, cover, language, save */}
    <div
      data-pane="right"
      className="md:sticky md:top-6 flex flex-col gap-5 rounded-md border border-line bg-surface p-5"
    >
      <div>
        <label htmlFor="pmf-excerpt" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Excerpt</label>
        <textarea
          id="pmf-excerpt"
          name="excerpt"
          value={value.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          rows={3}
          className="block w-full border border-line p-2 rounded bg-paper text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">Tags</label>
        <TagPicker allTags={allTags} value={value.tagIds} onChange={(ids) => update("tagIds", ids)} />
      </div>
      <div>
        <label htmlFor="pmf-cover" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Cover image URL</label>
        <input
          id="pmf-cover"
          name="coverImageUrl"
          value={value.coverImageUrl}
          onChange={(e) => update("coverImageUrl", e.target.value)}
          className="block w-full border border-line p-2 rounded bg-paper font-mono text-xs"
          placeholder="https://res.cloudinary.com/…"
        />
      </div>
      <div>
        <label htmlFor="pmf-lang" className="block text-xs uppercase tracking-wider text-muted mb-1.5">Language</label>
        <select
          id="pmf-lang"
          name="language"
          value={value.language}
          onChange={(e) => update("language", e.target.value as Lang)}
          className="block w-full border border-line p-2 rounded bg-paper"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full mt-2 px-6 py-3 rounded-full bg-ink text-paper hover:bg-accent transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  </form>
);
```

注意：在 `useState` 上方将 `Lang` 别名保留（已有）。imports / TagPicker / dynamic PostEditor 不变。

- [ ] **Step 4: 跑测试确认通过**

```bash
npx vitest run src/tests/unit/post-meta-form.test.tsx
```

Expected: 3 条全部 PASS。

- [ ] **Step 5: 手动验证两个 admin 入口**

```bash
npm run dev
```

- 登录 admin → 访问 `/admin/posts/new` —— 看到左右两栏布局，标题 + slug 在顶部，编辑器在下方左侧；右栏 excerpt / tags / cover / language / Save 从上到下排列。
- 访问任意已有 post 的 `/admin/posts/[id]/edit` —— 顶部仍有 `View ↗ / Publish 或 Unpublish / Delete` 操作行，主体两栏布局正常。
- 改窗口宽度到移动 viewport —— 单列堆叠，顺序合理。

- [ ] **Step 6: 跑现有 admin e2e 回归**

```bash
npx playwright test src/tests/e2e/admin-post-crud.spec.ts
```

Expected: PASS（form 字段语义不变，e2e 用的是 placeholder / role 定位，不受 UI 重排影响）。

- [ ] **Step 7: 提交**

```bash
git add src/components/admin/PostMetaForm.tsx src/tests/unit/post-meta-form.test.tsx
git commit -m "feat(admin): two-pane layout for PostMetaForm"
```

---

## Task 7: `/write` 路由

**Files:**
- Create: `src/app/(site)/write/page.tsx`

**Interfaces:**
- Consumes: `auth`、`listTags`、`PostMetaForm`、`createPost`（Task 5）。
- Produces: `/write` 渲染空 PostMetaForm；提交后调用 `createPost(values, { redirectTo: "preview" })`；非 admin 访问跳 `/`。

- [ ] **Step 1: 新建路由**

创建 `src/app/(site)/write/page.tsx`：

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listTags } from "@/lib/db/tags";
import { PostMetaForm } from "@/components/admin/PostMetaForm";
import { createPost } from "@/app/admin/_actions/posts";

export default async function WritePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const tags = await listTags();

  async function submit(v: Parameters<typeof createPost>[0]) {
    "use server";
    await createPost(v, { redirectTo: "preview" });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="font-serif text-3xl mb-6">Write</h1>
      <PostMetaForm
        initial={{ title: "", slug: "", language: "en", excerpt: "", coverImageUrl: "", contentJson: undefined, tagIds: [] }}
        allTags={tags}
        onSubmit={submit}
        submitLabel="Save draft"
      />
    </main>
  );
}
```

- [ ] **Step 2: 手动验证非 admin 鉴权**

```bash
npm run dev
```

未登录访问 `http://localhost:3000/write` —— 应被重定向到 `/`。

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无报错。

- [ ] **Step 4: 提交**

```bash
git add src/app/\(site\)/write/page.tsx
git commit -m "feat(write): admin-only /write entry for new drafts"
```

---

## Task 8: `/preview/[slug]` 路由

**Files:**
- Create: `src/app/(site)/preview/[slug]/page.tsx`

**Interfaces:**
- Consumes: `auth`、`getAdminPostBySlug`（Task 4）、`renderPostHtml`、`extractHeadings`、`readingTimeMinutes`、`TableOfContents`、`CodeBlockEnhancer`（既有）。
- Produces: `/preview/[slug]` admin-only 预览，渲染 draft 或 published 文章。draft 显示 `DRAFT PREVIEW` 横条（cinnabar），published 显示 `PREVIEW · LIVE`（accent）。右侧 `Edit ↗` 链接指向 `/admin/posts/[id]/edit`。

- [ ] **Step 1: 新建路由**

创建 `src/app/(site)/preview/[slug]/page.tsx`：

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminPostBySlug } from "@/lib/db/posts";
import { CodeBlockEnhancer } from "@/components/blog/CodeBlockEnhancer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { renderPostHtml } from "@/lib/blocknote/render";
import { extractHeadings } from "@/lib/extract-headings";
import { readingTimeMinutes } from "@/lib/reading-time";

export default async function PreviewPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTimeMinutes(JSON.stringify(post.contentJson));
  const html = await renderPostHtml(post.contentJson);
  const headings = extractHeadings(html);
  const isDraft = post.status === "draft";

  return (
    <>
      <div
        className={
          "sticky top-0 z-20 flex items-center justify-between px-5 py-2 text-xs uppercase tracking-wider border-b " +
          (isDraft
            ? "border-cinnabar/40 bg-cinnabar/10 text-cinnabar"
            : "border-accent/40 bg-accent/10 text-accent")
        }
      >
        <span>{isDraft ? "Draft preview" : "Preview · Live"}</span>
        <Link
          href={`/admin/posts/${post.id}/edit`}
          className="text-ink hover:text-accent normal-case tracking-normal"
        >
          Edit ↗
        </Link>
      </div>
      <main
        lang={post.language}
        className="mx-auto grid max-w-7xl gap-10 px-5 pt-16 pb-20 sm:px-[5vw] lg:grid-cols-[minmax(0,1fr)_240px] lg:pt-20 lg:pb-32"
      >
        <div className="min-w-0 break-words">
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="text-accent">{post.language}</span>
            <span>·</span>
            <span>
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "unpublished"}
            </span>
            <span>·</span>
            <span>{minutes} min read</span>
          </div>
          <h1 className="mt-5 font-serif text-[clamp(1.8rem,6vw,4rem)] leading-tight tracking-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base text-muted sm:text-lg">{post.excerpt}</p>
          )}
          <hr className="my-8 border-line lg:my-12" />
          <article
            className="prose prose-sm prose-stone max-w-none prose-headings:font-serif prose-img:rounded-lg prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-line prose-pre:bg-surface sm:prose-base"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <CodeBlockEnhancer />
        </div>
        <TableOfContents headings={headings} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: 手动验证**

```bash
npm run dev
```

- 未登录访问 `/preview/whatever` —— 404。
- 登录 admin 后访问一个已存在 draft 的 `/preview/<slug>` —— 看到顶部 `DRAFT PREVIEW` 横条（cinnabar），正文渲染正常，右上有 `Edit ↗`。
- 访问已 published 的 `/preview/<slug>` —— 顶部 `PREVIEW · LIVE`（accent）。

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无报错。

- [ ] **Step 4: 提交**

```bash
git add src/app/\(site\)/preview/\[slug\]/page.tsx
git commit -m "feat(preview): admin-only /preview/[slug] with status banner"
```

---

## Task 9: 端到端写作流测试

**Files:**
- Create: `src/tests/e2e/admin-write-flow.spec.ts`

**Interfaces:**
- Consumes: 整个 admin 写作流（Task 1–8）。
- Produces: 一个 Playwright spec 覆盖未登录访问保护 + admin 主页入口跳 `/write` + 提交跳 `/preview/[slug]`。

- [ ] **Step 1: 写 e2e**

新建 `src/tests/e2e/admin-write-flow.spec.ts`：

```ts
import { test, expect } from "@playwright/test";

test("anonymous user is redirected away from /write", async ({ page }) => {
  await page.goto("/write");
  await page.waitForURL("**/", { timeout: 5_000 });
  expect(page.url()).toMatch(/\/$/);
});

test("anonymous user gets 404 on /preview/[slug]", async ({ page }) => {
  const res = await page.goto("/preview/non-existent-slug");
  expect(res?.status()).toBe(404);
});

test.describe("authenticated admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"), { timeout: 10_000 });
  });

  test("admin sees Write card on homepage and can write → preview a draft", async ({ page }) => {
    await page.goto("/");
    const writeLink = page.getByRole("link", { name: /write a new post/i });
    await expect(writeLink).toBeVisible();
    await writeLink.click();
    await page.waitForURL("**/write", { timeout: 5_000 });

    const title = `E2E write ${Date.now()}`;
    await page.getByRole("textbox", { name: /^title$/i }).fill(title);

    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 15_000 });
    await editor.click();
    await page.keyboard.type("E2E preview body");

    await page.getByRole("button", { name: /save draft/i }).click();
    await page.waitForURL(/\/preview\/.+/, { timeout: 15_000 });

    await expect(page.getByText(/draft preview/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });
});
```

- [ ] **Step 2: 跑 e2e**

```bash
npx playwright test src/tests/e2e/admin-write-flow.spec.ts
```

Expected: 3 个用例全部 PASS。

- [ ] **Step 3: 跑整个测试套件兜底**

```bash
npx vitest run
npx playwright test
```

Expected: 全 PASS。

- [ ] **Step 4: 提交**

```bash
git add src/tests/e2e/admin-write-flow.spec.ts
git commit -m "test(e2e): admin homepage write entry → preview flow"
```

---

## Self-Review Summary

- ✅ Spec §1 主页 Write 卡 → Task 1–3
- ✅ Spec §2 PostMetaForm 左右排版 → Task 6
- ✅ Spec §3 `/write` 路由 → Task 7
- ✅ Spec §3 `createPost` 改造 → Task 5
- ✅ Spec §3 `/preview/[slug]` 路由 → Task 8
- ✅ Spec §3 `getAdminPostBySlug` → Task 4
- ✅ Spec 测试章节 → 单元测试嵌入 Task 1/2/4/6，e2e 集中在 Task 9
- ✅ 字段命名一致：`createPost(input, options?: { redirectTo?: "admin" | "preview" })` 在 Task 5/7 一致；`getAdminPostBySlug` 签名在 Task 4/8 一致；`WriteCard` 的 `enterIndex` prop 在 Task 2/3 一致。
