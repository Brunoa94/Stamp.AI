import { NextRequest } from "next/server";

/**
 * Validates IPv4 and IPv6 address formats.
 * Rejects garbage/injected values to prevent rate-limit bucket manipulation.
 */
function isValidIp(value: string): boolean {
  // IPv4: strict octet validation (0-255 in each position)
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  // IPv6: validate using URL parser (Edge-runtime compatible)
  // Wrapping in brackets and parsing as URL host is a reliable cross-platform approach
  if (value.includes(":")) {
    try {
      // URL constructor validates the bracketed IPv6 format
      new URL(`http://[${value}]`);
      return true;
    } catch {
      return false;
    }
  }

  return ipv4.test(value);
}

/**
 * Whether forwarding headers (x-forwarded-for / x-real-ip) can be trusted.
 *
 * These headers are set by the CLIENT unless a proxy in front of the app
 * overwrites them. Trusting them blindly lets an attacker rotate the header to
 * mint unlimited rate-limit buckets. So we only trust them when we know a
 * trusted proxy is terminating the request:
 *  - Vercel sets `VERCEL=1` and rewrites x-forwarded-for at its edge.
 *  - Any other trusted-proxy deployment must opt in with TRUST_PROXY_HEADERS=true.
 */
function proxyHeadersTrusted(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.TRUST_PROXY_HEADERS === "true"
  );
}

/**
 * Get the client identifier for rate limiting.
 *
 * Trust is EXPLICIT: a spoofable forwarding header is only honored when we know
 * it was set by a trusted proxy. When no trusted source is available we return
 * a shared "unknown" bucket rather than trust client-controlled input — failing
 * toward over-limiting a shared bucket instead of allowing trivial bypass.
 */
export function getClientIdentifier(request: NextRequest): string {
  // Cloudflare: only when explicitly behind Cloudflare.
  if (process.env.TRUST_CF_HEADERS === "true") {
    const cfIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cfIp && isValidIp(cfIp)) return cfIp;
  }

  if (proxyHeadersTrusted()) {
    // Prefer the single-valued x-real-ip; fall back to the first x-forwarded-for
    // entry (the client IP, as set by the trusted proxy).
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp && isValidIp(realIp)) return realIp;

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      const first = forwardedFor.split(",")[0]?.trim();
      if (first && isValidIp(first)) return first;
    }
  }

  // No trusted client IP available: don't trust spoofable headers.
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
