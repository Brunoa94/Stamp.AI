/**
 * Pluggable error reporting for Edge Functions.
 *
 * sentry.ts registers a reporter when SENTRY_DSN is configured; until then
 * reportError is a no-op. Kept free of Deno imports so errors.ts (and the
 * vitest suites that import it) stay runtime-agnostic.
 */

export type ErrorReporterT = (error: unknown, context?: Record<string, unknown>) => void;

let reporter: ErrorReporterT | null = null;

export function registerErrorReporter(next: ErrorReporterT | null): void {
  reporter = next;
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  try {
    reporter?.(error, context);
  } catch {
    // Reporting must never break the response.
  }
}
