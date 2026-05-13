import client from "@/lib/client";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

export async function rateLimit(
  userId: string,
  limit: number = 5,
  windowInSeconds: number = 60 * 60,
): Promise<RateLimitResult> {
  const key = `ratelimit:analyze:${userId}`;

  const current = await client.incr(key);

  if (current === 1) {
    await client.expire(key, windowInSeconds);
  }

  const ttl = await client.ttl(key);

  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl,
  };
}
