import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { URL } from "url";

// Local dev: remoteBindings false runs every binding (D1, R2, AI, EMAIL) via miniflare,
// so no Cloudflare login / OAuth is required. R2 + AI are emulated locally.
initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: false,
});

const assetsPublicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/^["']|["']$/g, "");
const assetsOrigin = assetsPublicUrl ? new URL(assetsPublicUrl) : null;

const nextConfig: NextConfig = {
  // Allow cross-origin dev asset requests when the app is accessed via the
  // VM's LAN IP (http://localhost:3000) while the server binds localhost.
  allowedDevOrigins: ["localhost"],
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
