import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { URL } from "url";

// remoteBindings must be true so per-binding `remote: true` (R2 in wrangler.jsonc) works.
// D1 stays local (no remote flag). R2 is remote so uploads are reachable via R2_PUBLIC_URL / r2.dev.
initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: true,
});

const assetsPublicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/^["']|["']$/g, "");
const assetsOrigin = assetsPublicUrl ? new URL(assetsPublicUrl) : null;

const nextConfig: NextConfig = {
  experimental: {
    // Local D1 (SQLite) cannot handle parallel static-generation workers.
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: assetsOrigin
      ? [
          {
            protocol: assetsOrigin.protocol.replace(":", "") as "http" | "https",
            hostname: assetsOrigin.hostname,
            port: assetsOrigin.port,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
