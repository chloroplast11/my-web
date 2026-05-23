import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#9c6b3a", letterSpacing: 4 }}>
          CHUCK CHEN
        </div>
        <div style={{ fontSize: 80, marginTop: 40, lineHeight: 1.05 }}>
          Frontend Engineer{" "}
          <span style={{ color: "#9c6b3a", fontStyle: "italic" }}>
            &amp; Photographer
          </span>
        </div>
        <div style={{ fontSize: 28, color: "#796f62", marginTop: 30 }}>
          Tokyo
        </div>
      </div>
    ),
    size,
  );
}
