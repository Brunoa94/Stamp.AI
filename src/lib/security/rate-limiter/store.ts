import type { RateLimitEntry } from "./types";

/**
 * In-memory store for rate limiting.
 * Edge Runtime compatible — no setInterval or Node.js-specific APIs.
 *
 * NOTE: This store is per-process. In a distributed / serverless environment
 * (Vercel, Cloudflare Workers) each instance has its own memory, so the limit
 * is per-replica, not global. Replace with Upstash Redis for global limits.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

/**
 * Lazily remove expired entries. Called on each write so no timer is needed.
 */
function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export function clearEntry(key: string): void {
  rateLimitStore.delete(key);
}

export function getEntry(key: string): RateLimitEntry | undefined {
  return rateLimitStore.get(key);
}

export function setEntry(key: string, entry: RateLimitEntry): void {
  maybeCleanup();
  rateLimitStore.set(key, entry);
}
