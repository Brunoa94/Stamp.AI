/**
 * Sentry for Edge Functions. Importing this module is enough: when SENTRY_DSN
 * is set it initialises the SDK and registers the reporter handleError uses;
 * without it nothing is sent. Events are scrubbed of e-mails, tokens and
 * auth headers before they leave the function.
 */

import * as Sentry from "npm:@sentry/deno@10.74.0";
import { registerErrorReporter } from "./errorReporting.ts";

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const TOKEN_PATTERN = /(Bearer\s+[A-Za-z0-9._~+/=-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|\b(sk|rk|whsec)_(live|test)_[A-Za-z0-9]+)/g;
const SENSITIVE_KEYS = new Set(["authorization", "cookie", "apikey", "stripe-signature", "paypal-transmission-sig"]);

function scrub(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return value.replace(TOKEN_PATTERN, "[redacted]").replace(EMAIL_PATTERN, "[redacted-email]");
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((entry) => scrub(entry, depth + 1));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
    key,
    SENSITIVE_KEYS.has(key.toLowerCase()) ? "[redacted]" : scrub(entry, depth + 1),
  ]));
}

const dsn = Deno.env.get("SENTRY_DSN");
export const sentryEnabled = Boolean(dsn);

if (dsn) {
  Sentry.init({
    dsn,
    environment: Deno.env.get("APP_ENV") || Deno.env.get("SENTRY_ENVIRONMENT") || "production",
    release: Deno.env.get("SENTRY_RELEASE") || undefined,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // deno-lint-ignore no-explicit-any
    beforeSend: (event: any) => scrub(event) as typeof event,
  });

  registerErrorReporter((error, context) => {
    Sentry.captureException(error, context ? { extra: context } : undefined);
    // Edge isolates can be frozen right after the response: flush in the background.
    const flushing = Sentry.flush(2000);
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(flushing);
  });
}

/** Sentry Cron check-in around a scheduled run (no-op without SENTRY_DSN). */
export async function withCronMonitor<T>(slug: string, run: () => Promise<T>): Promise<T> {
  if (!sentryEnabled) return run();
  const checkInId = Sentry.captureCheckIn({ monitorSlug: slug, status: "in_progress" });
  try {
    const result = await run();
    Sentry.captureCheckIn({ checkInId, monitorSlug: slug, status: "ok" });
    return result;
  } catch (error) {
    Sentry.captureCheckIn({ checkInId, monitorSlug: slug, status: "error" });
    throw error;
  } finally {
    await Sentry.flush(2000);
  }
}
