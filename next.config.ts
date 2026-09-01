import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { URL } from "url";

// remoteBindings must be true so per-binding `remote: true` (R2 in wrangler.jsonc) works.
// D1 stays local (no remote flag). R2 is remote so uploads are reachable via R2_PUBLIC_URL / r2.dev.
initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: true,
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
  experimental: {
    // Local D1 (SQLite) cannot handle parallel static-generation workers.
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: [r2DevPattern, ...envPattern],
  },
};

export default nextConfig;
