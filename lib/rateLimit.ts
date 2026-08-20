import { NextResponse } from "next/server";

type RateLimitState = {
  count: number;
  resetAtMs: number;
};

const buckets = new Map<string, RateLimitState>();

export function checkRateLimit({
  key,
  limit,
  windowMs,
  nowMs = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}) {
  const existing = buckets.get(key);
  if (!existing || nowMs >= existing.resetAtMs) {
    buckets.set(key, { count: 1, resetAtMs: nowMs + windowMs });
    return { ok: true as const, remaining: limit - 1, resetAtMs: nowMs + windowMs };
  }

  if (existing.count >= limit) {
    return { ok: false as const, remaining: 0, resetAtMs: existing.resetAtMs };
  }

  existing.count += 1;
  return { ok: true as const, remaining: Math.max(0, limit - existing.count), resetAtMs: existing.resetAtMs };
}

export function retryAfterSec(resetAtMs: number, nowMs = Date.now()) {
  return Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));
}

export function rateLimitMessage(retryAfterSeconds: number) {
  if (retryAfterSeconds < 60) {
    return `Too many requests. Try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}.`;
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export function rateLimitDenied(resetAtMs: number, nowMs = Date.now()) {
  const retryAfterSeconds = retryAfterSec(resetAtMs, nowMs);
  return {
    status: 429 as const,
    headers: { "Retry-After": String(retryAfterSeconds) },
    body: {
      error: rateLimitMessage(retryAfterSeconds),
      retryAfterSec: retryAfterSeconds,
    },
  };
}

export function rateLimitResponse(resetAtMs: number) {
  const denied = rateLimitDenied(resetAtMs);
  return NextResponse.json(denied.body, { status: denied.status, headers: denied.headers });
}
