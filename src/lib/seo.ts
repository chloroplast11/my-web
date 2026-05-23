import type { Metadata } from "next";
import { siteConfig } from "./site-config";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteConfig.name} — Frontend Engineer & Photographer`,
    template: `%s · ${siteConfig.name}`,
  },
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
  title: string;
  excerpt?: string | null;
  slug: string;
  publishedAt?: Date | null;
  language: "en" | "zh" | "ja";
}): Metadata {
  const url = `${baseUrl}/blog/${opts.slug}`;
  return {
    title: opts.title,
    description: opts.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: opts.title,
      description: opts.excerpt ?? undefined,
      publishedTime: opts.publishedAt?.toISOString(),
      locale:
        opts.language === "zh" ? "zh_CN" : opts.language === "ja" ? "ja_JP" : "en_US",
    },
  };
}
