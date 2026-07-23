import { NextRequest } from "next/server";

/**
 * Get the client identifier for rate limiting
 * Uses IP address, falling back to forwarded headers
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };
}
