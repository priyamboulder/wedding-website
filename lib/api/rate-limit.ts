// Distributed rate limiter with Upstash Redis backend.
// Falls back to in-memory sliding window when Redis is not configured.
// In-memory fallback resets on cold start — only use in development.

interface WindowEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, WindowEntry>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

async function checkRedis(
  key: string,
  { windowMs, max }: RateLimitOptions,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const windowSec = Math.ceil(windowMs / 1000);
    // INCR then EXPIRE in a pipeline
    const pipeline = [
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
      ["TTL", key],
    ];

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) return null;
    const results = await res.json() as { result: number }[];
    const count = results[0]?.result ?? 1;
    const ttl = results[2]?.result ?? windowSec;
    const resetAt = Date.now() + ttl * 1000;

    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt,
    };
  } catch {
    return null;
  }
}

function checkMemory(
  key: string,
  { windowMs, max }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    memStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  };
}

export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const redis = await checkRedis(key, opts);
  if (redis) return redis;
  return checkMemory(key, opts);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
