// Minimal Upstash REST-based rate limiter. Falls back to "always allow" if not configured.
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { allowed: true, remaining: limit };

  const now = Math.floor(Date.now() / 1000);
  const bucketKey = `rl:${key}:${Math.floor(now / windowSec)}`;
  // INCR and set expiry
  const incr = await fetch(`${url}/incr/${encodeURIComponent(bucketKey)}`, { headers: { Authorization: `Bearer ${token}` } });
  const count = Number(await incr.text());
  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(bucketKey)}/${windowSec}`, { headers: { Authorization: `Bearer ${token}` } });
  }
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
