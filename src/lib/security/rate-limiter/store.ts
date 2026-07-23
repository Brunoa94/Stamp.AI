import type { RateLimitEntry } from "./types";

/**
 * In-memory store for rate limiting
 * In production, replace with Redis/Upstash for distributed systems
 */
export const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

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

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

startCleanup();

export function clearEntry(key: string): void {
  rateLimitStore.delete(key);
}

export function getEntry(key: string): RateLimitEntry | undefined {
  return rateLimitStore.get(key);
}

export function setEntry(key: string, entry: RateLimitEntry): void {
  rateLimitStore.set(key, entry);
}
