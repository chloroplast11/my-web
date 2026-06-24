# 主页写作入口 + 左右排版写作页

**Date:** 2026-06-24
**Status:** Draft

## 背景

目前博客文章的新建/编辑入口只在 `/admin/posts/...` 后台路径下，主页（bento 网格）没有任何写作入口。现有 [PostMetaForm](../../../src/components/admin/PostMetaForm.tsx) 采用上下排版：标题 → slug/语言 → 摘要 → 封面 → 标签 → 编辑器。

## 目标

1. 在主页 bento 网格上增加一个仅 admin 可见的"写文章"入口卡片。
2. 将现有写作页（admin 后台 + 新增的主页入口）重新设计为左右排版，复用同一个表单组件。
3. 从主页入口创建草稿后，跳转到一个仅 admin 可见的预览页，让作者直接查看文章渲染效果。

## 非目标

- 不修改 BlockNote 编辑器本身。
- 不引入新的草稿版本控制 / 自动保存机制。
- 不改变现有发布、撤回、删除等 server action 的核心逻辑（仅微调 `createPost` 的跳转参数）。
- 不修改非 admin 用户对 `/blog/[slug]` 的可见性。

---

## 设计概览

### 三个改动方向

1. **首页 Write 卡片**：新增一张 bento card，仅 admin 登录时渲染。
2. **左右排版的写作表单**：改造 `PostMetaForm`，左侧编辑器+标题+slug、右侧元数据+保存。三个入口（`/write`、`/admin/posts/new`、`/admin/posts/[id]/edit`）共用。
3. **草稿预览路由**：新增 `/preview/[slug]`，仅 admin 可见，复用现有博客渲染但允许 draft 状态。`/write` 保存后跳转到此预览页。

---

## §1 · 首页 Write 卡片

### 加入 bento 系统

修改 [src/lib/bento-defaults.ts](../../../src/lib/bento-defaults.ts)：

- 在 `CARD_IDS` 末尾追加 `"write"`。
- 在 `BENTO_DEFAULTS` 加入：
  ```ts
  write: { x: 690, y: 340, w: 120, h: 56, minW: 100, minH: 48 }
  ```
  位置避开既有满布（photos 在右上、likes 在右下、clock-analog 在右中），落在右下方 photos 与 likes 之间的空隙。最终视觉细节可在实现时根据真实渲染微调。
- 在 `layoutReadSchema` 和 `layoutWriteSchema` 加入 `write: cardBoxReadSchema.optional()` / `cardBoxWriteSchema.optional()`。

### 卡片组件

新建 [src/components/home/bento/cards/WriteCard.tsx](../../../src/components/home/bento/cards/WriteCard.tsx)：

- 风格：仿 `LikesCard` 的"安静"风格 —— `bg-surface` + `border border-line-2` + `rounded-lg` + `shadow-[0_4px_10px_rgba(36,30,23,0.12)]`。
- 内部布局：水平 flex，14px 羽毛笔 SVG 图标 + `font-serif italic` 小写 `write` 文字（约 11–13px，随断点放大）。
- 颜色：默认 `text-ink` / 图标 `text-muted`，hover 时文字与图标都变 `text-accent`，整卡 `scale-[1.03]` 轻微放大。
- 包裹为 `<Link href="/write">`，内层 `<CardFrame cardId="write" ... />` 让它继承现有 enter 动画、拖拽、resize 等基础设施。
- 不读取或写入任何业务数据，纯导航卡。

### 在主页条件渲染

在 [src/app/(site)/page.tsx](../../../src/app/(site)/page.tsx) 的 `<EditableBento>` 内，紧接现有 `LikesCard`（其 `enterIndex={8}`）之后：

```tsx
{isAdmin && <WriteCard enterIndex={9} />}
```

`enterIndex={9}` 让 Write 卡在 admin 视角中作为最后一张依次入场。

非 admin 用户：组件不渲染，layout 系统对缺失 cardId 已通过 `mergeLayout` 容错（已有的合并逻辑会忽略未渲染的卡片）。

### 行为

- 普通态：点击 → 跳 `/write`。
- 进入 bento edit mode（admin 点右上角铅笔）：和其他卡片一样可拖拽 / resize；点击行为被 `CardFrame` 的 drag/resize 手势接管，不会触发链接跳转（已是现有机制，复用即可）。
- 默认位置仅对 admin 视角生效；普通访客的服务器读到的 layout 中没有 `write` 字段也不影响渲染。

---

## §2 · 左右排版写作表单

### 整体框架

改造 [src/components/admin/PostMetaForm.tsx](../../../src/components/admin/PostMetaForm.tsx)，将上下顺序改为两栏：

- **桌面端（≥ md）**：CSS grid，`grid-template-columns: minmax(0, 1fr) 300px`，列间距 `gap-8`。
- **移动端（< md）**：单列堆叠。

### 左栏（编辑器区）

顶部 sticky 标题/slug 区：

```
┌──────────────────────────────────────────────┐
│ <title input>  ← 大号 serif，无边框透明背景    │
│ /blog/<slug input>  ← 等宽小号，虚线下划线    │
├──────────────────────────────────────────────┤
│ BlockNote 编辑器（≥ 460px min-height）        │
│ …                                             │
└──────────────────────────────────────────────┘
```

- 标题：`text-3xl xl:text-4xl`，`font-serif`，`border-none bg-transparent outline-none`；slug 同步生成沿用 `slugify` 现有逻辑。
- Slug 行：等宽字体，前缀 `/blog/` 灰色，输入框透明 + 虚线下边框。
- Sticky 头部：`sticky top-0 bg-paper pb-3 border-b border-line`（背景需与页面背景一致避免穿透）。
- 编辑器容器维持现有 `border border-line rounded p-2`，但 `min-h` 增至 `min-h-[460px]`，让长文写作更舒展。

### 右栏（元数据 + 保存）

桌面端 sticky，固定宽 300px：

```
┌────────────────────┐
│ Excerpt            │
│ [textarea]         │
├────────────────────┤
│ Tags               │
│ [TagPicker chips]  │
├────────────────────┤
│ Cover image URL    │
│ [input mono]       │
├────────────────────┤
│ Language           │
│ [select]           │
├────────────────────┤
│ [Save]             │
└────────────────────┘
```

- 容器：`sticky top-6 bg-surface border border-line rounded-md p-5 flex flex-col gap-5`。
- 字段标签沿用现有 `text-xs uppercase tracking-wider text-muted` 样式。
- Save 按钮维持现有圆角实心 `bg-ink text-paper rounded-full`，宽度撑满右栏。
- 与编辑器内联的"contentJson"传递不变 —— 仍由 PostEditor 通过 `onChange` 回传。

### 移动端折叠

将 grid 改为单列：标题/slug → 编辑器 → 元数据 section（excerpt → tags → cover → language）→ Save 按钮（全宽）。右栏的 sticky 在移动端自动失效（因为不分两栏，只是普通从上到下的 section）。

### 顶部 h1 与操作行的归属

`PostMetaForm` 不负责 h1 与发布/删除等操作行。三个入口页各自渲染顶部：

| 入口页 | h1 | 操作行 |
|---|---|---|
| `/write` | `<h1>Write</h1>` | 无 |
| `/admin/posts/new` | `<h1>New post</h1>` | 无 |
| `/admin/posts/[id]/edit` | `<h1>Edit post</h1>` | `View ↗` / `Publish` 或 `Unpublish` / `Delete`（现有结构原样保留） |

### 影响范围与回归

- 三个入口页主体已经委托给 `PostMetaForm`，只需在 form 内部改 grid，admin 页面外层结构无需变动。
- 现有保存按钮的 `pending` 状态、`useTransition`、`onChange` 数据流都不变。
- 写入时 `contentJson`、`slug`、`excerpt` 等字段语义与字段集都不变 → server action 与数据库 schema 无需迁移。

---

## §3 · `/write` 路由与草稿预览

### 新建 `/write`

新建 [src/app/(site)/write/page.tsx](../../../src/app/(site)/write/page.tsx)：

- Server component，调用 `auth()`：未登录或非 admin → `redirect("/")`。
- 调用 `listTags()` 拿 tags。
- 渲染 `<h1>Write</h1>` + `<PostMetaForm>`，初值与 `/admin/posts/new` 一致。
- `onSubmit` 内：`"use server"` wrapper 调用 `createPost(values, { redirectTo: "preview" })`。

放在 `(site)` route group 下，沿用前台 layout（保持"在首页之外的写作工作台"体验），不引入 admin layout 的 padding 与 chrome。

### 改造 `createPost`

修改 [src/app/admin/_actions/posts.ts](../../../src/app/admin/_actions/posts.ts)：

```ts
export async function createPost(
  input: z.infer<typeof PostInput>,
  options?: { redirectTo?: "admin" | "preview" }
) {
  // …existing create logic…
  revalidatePath("/admin/posts");
  if (options?.redirectTo === "preview") {
    redirect(`/preview/${post.slug}`);
  }
  redirect(`/admin/posts/${post.id}/edit`);
}
```

`/admin/posts/new` 的 wrapper 不传 `options` → 行为完全不变。

### 新建 `/preview/[slug]`

新建 [src/app/(site)/preview/[slug]/page.tsx](../../../src/app/(site)/preview/%5Bslug%5D/page.tsx)：

- Server component，先 `auth()` 鉴权：未登录或非 admin → `notFound()`（不暴露草稿存在）。
- 调用新增的 `getAdminPostBySlug(slug)`（不限制 status，admin 可见 draft）。
- 沿用 [blog/[slug]/page.tsx](../../../src/app/(site)/blog/%5Bslug%5D/page.tsx) 的渲染主体（reading time、TOC、prose 等）。
- 页面顶部固定一条状态横条（`text-xs uppercase tracking-wider`）：当 `post.status === "draft"` 时文字为 `DRAFT PREVIEW`（cinnabar 颜色提示）；当 `published` 时为 `PREVIEW · LIVE`（muted/accent 颜色）。横条右侧带 `Edit ↗` 链接指向 `/admin/posts/[id]/edit`，让 admin 能直接回到编辑器。这样预览路由对 draft / published 都可用，admin 不会看到含混的状态。

### 数据层新增

[src/lib/db/posts.ts](../../../src/lib/db/posts.ts) 增加：

```ts
export async function getAdminPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    // 不过滤 status，admin 视角可见 draft / published
  });
}
```

不修改现有 `getPublishedPostBySlug`。

### 行为总结

- 主页 admin 点 Write 卡 → `/write` → 表单 → Save → `/preview/{slug}`（即时看到渲染效果）。
- 想发布或继续编辑：`/preview/{slug}` 顶部 `Edit ↗` → `/admin/posts/{id}/edit`（已有 Publish / Unpublish / Delete）。
- admin 后台流程（posts 列表 → New / Edit）行为不变。
- 非 admin 访问 `/write` 或 `/preview/{slug}` → 一律 `redirect("/")` 或 `notFound()`，不暴露任何信息。

---

## §4 · 受影响文件清单

### 新建（4）

- `src/components/home/bento/cards/WriteCard.tsx`
- `src/app/(site)/write/page.tsx`
- `src/app/(site)/preview/[slug]/page.tsx`
- 单元测试见 §测试

### 修改（6）

- `src/lib/bento-defaults.ts` — 加 `"write"` 到 `CARD_IDS` / `BENTO_DEFAULTS` / 两个 schema。
- `src/components/admin/PostMetaForm.tsx` — 上下排版改为左右两栏。
- `src/app/admin/_actions/posts.ts` — `createPost` 接受 `options.redirectTo`。
- `src/lib/db/posts.ts` — 增 `getAdminPostBySlug`。
- `src/app/(site)/page.tsx` — `{isAdmin && <WriteCard … />}`。
- `src/app/admin/posts/new/page.tsx`、`src/app/admin/posts/[id]/edit/page.tsx` — 主体已由 `PostMetaForm` 内部接管；外层 h1 / 操作行结构保持现状。

---

## 测试

### 单元（vitest）

- `bento-defaults`：`CARD_IDS` 包含 `"write"`，`BENTO_DEFAULTS.write` 字段齐全且满足 schema。
- `mergeLayout`：当持久化 layout 不含 `write` 字段时，hydrate 后 `write` 仍能取到默认 box（沿用现有用例模式）。
- `createPost`：传入 `{ redirectTo: "preview" }` 时调用 `redirect("/preview/{slug}")`；不传时维持原行为（用 mock 验证 `redirect` 调用参数）。
- `getAdminPostBySlug`：能返回 draft；无匹配 slug 时返回 `null`。

### e2e（Playwright，依现有 fixture 模式）

- 未登录用户访问 `/write` → 跳到 `/`。
- 未登录用户访问 `/preview/some-slug` → 404。
- admin 登录后主页能看到 Write 卡，未登录访客不可见。
- admin 在 `/write` 填表 → Save → URL 变成 `/preview/{slug}` 且页面显示 DRAFT 横条与正文。

### 手测

- 桌面端两栏 sticky 行为：滚动长文时标题/slug、右栏元数据始终在视野内。
- 移动端单列堆叠：操作行 → 标题/slug → 编辑器 → 元数据 → Save，顺序自然。
- bento edit mode 下 Write 卡可拖拽、resize；保存后下次刷新位置持久。

---

## 风险与权衡

- **跨入口共用同一表单**：编辑页（带 Publish 等）和新建页（无操作行）共用 form，但操作行已外置到入口页，form 内部无需感知。
- **草稿预览的可发现性**：仅靠 URL（`/preview/{slug}`），非 admin 访问被静默 404 即可避免泄露。短期不做更严格的链接签名机制。
- **首页 Write 卡片的拖拽行为**：因 `CardFrame` 会拦截点击为拖拽手势，需确认在非编辑模式下 `<Link>` 的点击仍能正常跳转（沿用 LikesCard 模式，已有先例）。
- **bento layout schema 演化**：新增 `"write"` 是向后兼容的（旧 layout 无此字段时 mergeLayout 用默认值），无需数据迁移。
