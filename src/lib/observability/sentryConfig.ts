/**
 * Shared Sentry options for the browser, server and edge runtimes.
 *
 * Sentry stays off unless NEXT_PUBLIC_SENTRY_DSN is set, and never runs in
 * development. Events are scrubbed of e-mail addresses, tokens and cookies
 * before they leave the app; default PII collection is disabled.
 */

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const SECRET_KEY_PATTERN = /\b(sk|rk|pk|whsec)_(live|test)_[A-Za-z0-9]+/g;
const SENSITIVE_HEADERS = ["authorization", "cookie", "set-cookie", "x-supabase-auth", "apikey"];

export interface SentryEnvI {
  dsn?: string;
  nodeEnv?: string;
  vercelEnv?: string;
  release?: string;
  tracesSampleRate?: string;
}

export function readSentryEnv(): SentryEnvI {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  };
}

export function scrubText(value: string): string {
  return value
    .replace(BEARER_PATTERN, "Bearer [redacted]")
    .replace(JWT_PATTERN, "[redacted-jwt]")
    .replace(SECRET_KEY_PATTERN, "[redacted-key]")
    .replace(EMAIL_PATTERN, "[redacted-email]");
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrubText(value);
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((entry) => scrubValue(entry, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SENSITIVE_HEADERS.includes(key.toLowerCase()) ? "[redacted]" : scrubValue(entry, depth + 1),
    ]),
  );
}

/** beforeSend: removes identifying data from an event before it is sent. */
export function scrubEvent<T>(event: T): T {
  const scrubbed = scrubValue(event) as T & { user?: Record<string, unknown> };
  if (scrubbed.user) scrubbed.user = scrubbed.user.id ? { id: scrubbed.user.id } : {};
  return scrubbed;
}

function sampleRate(raw: string | undefined, fallback: number): number {
  const value = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
}

export function buildSentryOptions(env: SentryEnvI = readSentryEnv()) {
  const environment = env.vercelEnv || env.nodeEnv || "development";
  return {
    dsn: env.dsn,
    enabled: Boolean(env.dsn) && env.nodeEnv !== "development",
    environment,
    release: env.release,
    tracesSampleRate: sampleRate(env.tracesSampleRate, 0.1),
    sendDefaultPii: false,
    enableLogs: true,
    beforeSend: scrubEvent,
  };
}
