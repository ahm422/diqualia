/// <reference path="../env.d.ts" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    R2: R2Bucket;
    ASSETS: Fetcher;
    R2_PUBLIC_URL: string;
    /** Cloudflare Email Service binding (wrangler send_email → EMAIL) */
    EMAIL?: SendEmail;
  }
}

export {};
