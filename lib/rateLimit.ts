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

