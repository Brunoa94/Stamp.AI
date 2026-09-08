import { NextRequest } from "next/server";
import type {
  RateLimitConfig,
  RateLimitEntry,
  RateLimitResult,
  RateLimitStatus,
  CombinedRateLimitResult,
} from "./types";
import { getEntry, setEntry, clearEntry } from "./store";
import { getClientIdentifier, createRateLimitHeaders } from "./utils";

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the client (IP or user ID)
 * @param endpoint - Endpoint identifier for separate rate limit buckets
 * @param config - Rate limit configuration
 * @returns Object with isLimited flag and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const entry = getEntry(key);

  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
    };
    setEntry(key, newEntry);

    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      retryAfter: 0,
    };
  }

  entry.count += 1;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      isLimited: true,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    isLimited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    retryAfter: 0,
  };
}

/**
 * Combined rate limiter that checks both IP and user-based limits
 */
export function checkCombinedRateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig,
  userId?: string
): CombinedRateLimitResult {
  const clientIp = getClientIdentifier(request);

  const ipResult = checkRateLimit(clientIp, `ip:${endpoint}`, config);

  if (ipResult.isLimited) {
    return {
      ...ipResult,
      headers: {
        ...createRateLimitHeaders(ipResult.remaining, ipResult.resetTime, config.maxRequests),
        "Retry-After": ipResult.retryAfter.toString(),
      },
    };
  }

  if (userId) {
    const userConfig = {
      ...config,
      maxRequests: config.maxRequests * 2,
    };
    const userResult = checkRateLimit(userId, `user:${endpoint}`, userConfig);

    if (userResult.isLimited) {
      return {
        ...userResult,
        headers: {
          ...createRateLimitHeaders(userResult.remaining, userResult.resetTime, userConfig.maxRequests),
          "Retry-After": userResult.retryAfter.toString(),
        },
      };
    }

    const remaining = Math.min(ipResult.remaining, userResult.remaining);
    return {
      isLimited: false,
      remaining,
      resetTime: Math.min(ipResult.resetTime, userResult.resetTime),
      retryAfter: 0,
      headers: createRateLimitHeaders(remaining, ipResult.resetTime, config.maxRequests),
    };
  }

  return {
    ...ipResult,
    headers: createRateLimitHeaders(ipResult.remaining, ipResult.resetTime, config.maxRequests),
  };
}

/**
 * Clear rate limit for a specific identifier (useful for testing or admin actions)
 */
export function clearRateLimit(identifier: string, endpoint: string): void {
  const key = `${endpoint}:${identifier}`;
  clearEntry(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitStatus {
  const key = `${endpoint}:${identifier}`;
  const entry = getEntry(key);
  const now = Date.now();

  if (!entry || entry.resetTime < now) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}
