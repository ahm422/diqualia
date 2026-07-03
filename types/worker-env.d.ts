/// <reference path="../env.d.ts" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    R2: R2Bucket;
    ASSETS: Fetcher;
    R2_PUBLIC_URL: string;
  }
}

export {};
