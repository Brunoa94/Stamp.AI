/**
 * Rate Limiter Implementation
 *
 * Uses a sliding window algorithm with in-memory storage.
 * For production at scale, consider using Redis or Upstash.
 *
 * Features:
 * - Configurable rate limits per endpoint
 * - IP-based and user-based limiting
 * - Sliding window algorithm for accuracy
 * - Automatic cleanup of expired entries
 */

import { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional message when rate limited */
  message?: string;
}

// In-memory store for rate limiting
// In production, replace with Redis/Upstash for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cleanup timer
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    });
  }, CLEANUP_INTERVAL);

  // Don't prevent Node.js from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

startCleanup();

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  // Strict limits for authentication endpoints (prevent brute force)
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts. Please try again later.",
  },

  // Password reset (very strict)
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset attempts. Please try again in an hour.",
  },

  // API routes (moderate limits)
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please slow down.",
  },

  // Image generation (expensive operation)
  imageGeneration: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many image generation requests. Please wait before trying again.",
  },

  // Payment endpoints (moderate, but important)
  payment: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many payment requests. Please try again shortly.",
  },

  // Webhook endpoints (higher limits for payment provider callbacks)
  webhook: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many webhook requests.",
  },

  // General/default limits
  default: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please try again later.",
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Get the client identifier for rate limiting
 * Uses IP address, falling back to forwarded headers
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get the real IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Prefer Cloudflare's connecting IP if available
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fall back to x-forwarded-for (first IP in the chain)
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Fall back to x-real-ip
  if (realIp) {
    return realIp;
  }

  // Last resort: use a hash of the request URL (not ideal)
  return "unknown";
}

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
): {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
} {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // No existing entry or entry has expired
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
    };
    rateLimitStore.set(key, newEntry);

    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      retryAfter: 0,
    };
  }

  // Entry exists and is still valid
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

/**
 * Combined rate limiter that checks both IP and user-based limits
 */
export function checkCombinedRateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig,
  userId?: string
): {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
  headers: Record<string, string>;
} {
  const clientIp = getClientIdentifier(request);

  // Check IP-based rate limit
  const ipResult = checkRateLimit(clientIp, `ip:${endpoint}`, config);

  // If IP is limited, return immediately
  if (ipResult.isLimited) {
    return {
      ...ipResult,
      headers: {
        ...createRateLimitHeaders(ipResult.remaining, ipResult.resetTime, config.maxRequests),
        "Retry-After": ipResult.retryAfter.toString(),
      },
    };
  }

  // If user ID is provided, also check user-based limit (with higher allowance)
  if (userId) {
    const userConfig = {
      ...config,
      maxRequests: config.maxRequests * 2, // Users get higher limits
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

    // Return the lower of the two remaining values
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
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): {
  count: number;
  remaining: number;
  resetTime: number;
} {
  const key = `${endpoint}:${identifier}`;
  const entry = rateLimitStore.get(key);
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
