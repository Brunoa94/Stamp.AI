import type { RateLimitConfig } from "./types";

/**
 * Predefined rate limit configurations for different endpoint types
 */
/**
 * Optional per-environment overrides. Production leaves these unset; the
 * acceptance suite's dedicated app server raises them because one machine
 * drives hundreds of logins and generations through a single IP.
 */
function envLimit(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Strict limits for authentication endpoints (prevent brute force)
  auth: {
    maxRequests: envLimit("RATE_LIMIT_AUTH_MAX", 5),
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
    maxRequests: envLimit("RATE_LIMIT_IMAGE_GENERATION_MAX", 10),
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
