import { NextRequest } from "next/server";

/**
 * Get the client identifier for rate limiting.
 *
 * Priority:
 * 1. `cf-connecting-ip` — only trusted when TRUST_CF_HEADERS=true, i.e. the
 *    app is confirmed to be behind Cloudflare (otherwise it is spoofable).
 * 2. `x-forwarded-for` first entry — on Vercel (Next.js 15+) this is set by
 *    platform infrastructure after stripping any client-supplied value, so it
 *    is safe to trust. On other hosts, only trust it if your reverse proxy
 *    strips the header before forwarding.
 * 3. Falls back to "unknown" so all unidentified clients share one bucket.
 */
export function getClientIdentifier(request: NextRequest): string {
  // Cloudflare: only trust cf-connecting-ip when explicitly configured
  if (process.env.TRUST_CF_HEADERS === "true") {
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;
  }

  // Vercel / platform-injected x-forwarded-for (first entry = client IP)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };
}
