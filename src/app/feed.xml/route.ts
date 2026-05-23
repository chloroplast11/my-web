import { Feed } from "feed";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const feed = new Feed({
    title: `${siteConfig.name} — Writing`,
    description: "Notes on engineering, design, and the light I keep chasing.",
    id: base,
    link: base,
    language: "en",
    image: `${base}/opengraph-image`,
    favicon: `${base}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: { rss2: `${base}/feed.xml` },
    author: { name: siteConfig.name, email: siteConfig.email, link: base },
  });
  for (const p of posts) {
    feed.addItem({
      title: p.title,
      id: `${base}/blog/${p.slug}`,
      link: `${base}/blog/${p.slug}`,
      description: p.excerpt ?? undefined,
      content: p.contentHtml ?? undefined,
      date: p.publishedAt ?? p.createdAt,
    });
  }
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/xml" },
  });
}
