import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { URL } from "url";

// Local dev: remoteBindings false runs every binding (D1, R2, AI, EMAIL) via miniflare,
// so no Cloudflare login / OAuth is required. R2 + AI are emulated locally.
initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: false,
});

// Strip any surrounding quotes an env pipeline might leave on the value.
const assetsPublicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/^["']|["']$/g, "");
const assetsOrigin = assetsPublicUrl ? new URL(assetsPublicUrl) : null;

// Static safety net. `remotePatterns` must never be empty: R2_PUBLIC_URL is a runtime
// Worker var (wrangler.jsonc) and lives only in the git-ignored .env locally, so it is
// undefined during `next build` / `opennextjs-cloudflare build` in CI and deploy. Without
// this entry the image optimizer rejects every R2 URL with 400 `"url" parameter is not allowed`.
const r2DevPattern = {
  protocol: "https" as const,
  hostname: "**.r2.dev",
  // The upload route only ever writes keys under `uploads/`.
  pathname: "/uploads/**",
};

// Additionally derive an entry from R2_PUBLIC_URL when it *is* set at build time, so a future
// custom asset domain also works. Skipped when it would only duplicate the r2.dev wildcard.
const envPattern =
  assetsOrigin && !assetsOrigin.hostname.endsWith(".r2.dev")
    ? [
        {
          protocol: assetsOrigin.protocol.replace(":", "") as "http" | "https",
          hostname: assetsOrigin.hostname,
          port: assetsOrigin.port,
          pathname: "/**",
        },
      ]
    : [];

const nextConfig: NextConfig = {
  // Allow cross-origin dev asset requests when the app is accessed via the
  // VM's LAN IP (http://localhost:3000) while the server binds localhost.
  allowedDevOrigins: ["localhost"],
  experimental: {
    // Local D1 (SQLite) cannot handle parallel static-generation workers.
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: [r2DevPattern, ...envPattern],
  },
};

export default nextConfig;
