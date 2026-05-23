import { siteConfig } from "@/lib/site-config";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export function ArticleJsonLd({
  title,
  slug,
  publishedAt,
  excerpt,
}: {
  title: string;
  slug: string;
  publishedAt: Date | null;
  excerpt: string | null;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt ?? undefined,
    url: `${base}/blog/${slug}`,
    datePublished: publishedAt?.toISOString(),
    author: { "@type": "Person", name: siteConfig.name, url: base },
    image: `${base}/blog/${slug}/opengraph-image`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
