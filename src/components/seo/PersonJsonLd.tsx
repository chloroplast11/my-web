import { siteConfig } from "@/lib/site-config";

const base = process.env.NEXT_PUBLIC_SITE_URL!;

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: base,
    email: `mailto:${siteConfig.email}`,
    jobTitle: "Frontend Engineer",
    sameAs: Object.values(siteConfig.socials),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
