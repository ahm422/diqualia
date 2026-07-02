import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { URL } from "url";

initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: false,
});

const assetsPublicUrl = process.env.R2_PUBLIC_URL ?? "";
const assetsOrigin = assetsPublicUrl ? new URL(assetsPublicUrl) : null;

const nextConfig: NextConfig = {
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
