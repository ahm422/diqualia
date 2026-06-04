import type { NextConfig } from "next";
import { URL } from "url";

const garagePublicUrl = process.env.GARAGE_PUBLIC_URL ?? "";
const garageOrigin = garagePublicUrl ? new URL(garagePublicUrl) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: garageOrigin
      ? [
          {
            protocol: garageOrigin.protocol.replace(":", "") as "http" | "https",
            hostname: garageOrigin.hostname,
            port: garageOrigin.port,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
