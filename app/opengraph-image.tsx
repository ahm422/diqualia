import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site-config";

export const alt = "DiQualia — Marketing Intelligence & Research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static, self-contained branded card — no external fonts or images so it can be
// statically optimized at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0b0d",
          color: "#f8f6f0",
          padding: "80px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#caa84b",
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 76, lineHeight: 1.1, maxWidth: 900 }}>
          Marketing intelligence &amp; research for niche B2B companies
        </div>
        <div style={{ fontSize: 30, color: "rgba(248,246,240,0.6)" }}>
          Research-first strategy · buyer mapping · precision pipeline growth
        </div>
      </div>
    ),
    size,
  );
}
