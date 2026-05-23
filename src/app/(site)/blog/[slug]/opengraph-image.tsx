import { ImageResponse } from "next/og";
import { getPublishedPostBySlug } from "@/lib/db/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  const title = post?.title ?? "Chuck Chen";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f3ede1",
          color: "#241e17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 24, color: "#9c6b3a", letterSpacing: 4 }}>
          WRITING
        </div>
        <div style={{ fontSize: 72, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 24, color: "#796f62" }}>chuckchen.dev</div>
      </div>
    ),
    size,
  );
}
