export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional message when rate limited */
  message?: string;
}

export interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

export interface CombinedRateLimitResult extends RateLimitResult {
  headers: Record<string, string>;
}

export interface RateLimitStatus {
  count: number;
  remaining: number;
  resetTime: number;
}
