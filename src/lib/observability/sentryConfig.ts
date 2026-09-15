/**
 * Sentry configuration shared by the client, server and edge inits.
 *
 * Everything here is pure (no Sentry runtime import) so it can be unit
 * tested. `buildSentryBaseOptions` turns raw env values into the common
 * `Sentry.init` options; each runtime config adds its own integrations.
 *
 * Env vars (see .env.example):
 *   NEXT_PUBLIC_SENTRY_DSN                 project DSN (public by design)
 *   NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE  0..1, default 0.1
 *   VERCEL_ENV / NEXT_PUBLIC_VERCEL_ENV    production | preview | development
 *   VERCEL_GIT_COMMIT_SHA / NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA  release id
 */

import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

export interface SentryEnvInputI {
  dsn?: string;
  vercelEnv?: string;
  nodeEnv?: string;
  commitSha?: string;
  tracesSampleRate?: string;
}

export interface SentryBaseOptionsI {
  dsn: string | undefined;
  enabled: boolean;
  environment: string;
  release: string | undefined;
  tracesSampleRate: number;
  sendDefaultPii: false;
  beforeSend: typeof scrubSentryEvent;
}

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

export function getSentryEnvironment(input: SentryEnvInputI): string {
  return input.vercelEnv || input.nodeEnv || "development";
}

/** Sentry only reports outside local development, and only with a DSN. */
export function isSentryEnabled(input: SentryEnvInputI): boolean {
  return Boolean(input.dsn) && getSentryEnvironment(input) !== "development";
}

export function getTracesSampleRate(input: SentryEnvInputI): number {
  const parsed = input.tracesSampleRate ? Number(input.tracesSampleRate) : NaN;
  if (!Number.isFinite(parsed)) return DEFAULT_TRACES_SAMPLE_RATE;
  return Math.min(1, Math.max(0, parsed));
}

export function buildSentryBaseOptions(input: SentryEnvInputI): SentryBaseOptionsI {
  return {
    dsn: input.dsn || undefined,
    enabled: isSentryEnabled(input),
    environment: getSentryEnvironment(input),
    release: input.commitSha || undefined,
    tracesSampleRate: getTracesSampleRate(input),
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
  };
}

// ─── PII scrubbing ───────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const SECRET_KEY_PATTERN = /\b(?:sk|rk|pk)[-_](?:live|test)?[-_]?[A-Za-z0-9]{8,}/g;

const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|api[-_]?key|apikey|authorization|cookie|session|credit[-_]?card|card[-_]?number|cvv|ssn)/i;

const SENSITIVE_HEADERS = new Set(["cookie", "set-cookie", "authorization", "x-api-key", "apikey"]);

const REDACTED = "[redacted]";

export function scrubString(value: string): string {
  return value
    .replace(BEARER_PATTERN, `Bearer ${REDACTED}`)
    .replace(JWT_PATTERN, "[jwt]")
    .replace(SECRET_KEY_PATTERN, "[secret]")
    .replace(EMAIL_PATTERN, "[email]");
}

function scrubUnknown(value: unknown): unknown {
  if (typeof value === "string") return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubUnknown);
  if (value && typeof value === "object") {
    return scrubRecord(value as Record<string, unknown>);
  }
  return value;
}

function scrubRecord<T extends Record<string, unknown>>(record: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : scrubUnknown(value);
  }
  return result as T;
}

function scrubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (SENSITIVE_KEY_PATTERN.test(key)) parsed.searchParams.set(key, REDACTED);
    }
    return scrubString(parsed.toString());
  } catch {
    return scrubString(url);
  }
}

function scrubHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) continue;
    result[key] = scrubString(value);
  }
  return result;
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const result: Breadcrumb = { ...breadcrumb };
  if (typeof result.message === "string") result.message = scrubString(result.message);
  if (result.data) result.data = scrubRecord(result.data);
  return result;
}

/**
 * `beforeSend` hook: strips emails, bearer tokens, JWTs, API keys and cookies
 * from an event before it leaves the process. Never drops events — only
 * redacts — so error volume stays visible.
 */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event };

  if (scrubbed.user) {
    const { email: _email, ip_address: _ip, username: _username, ...rest } = scrubbed.user;
    scrubbed.user = scrubRecord(rest);
  }

  if (scrubbed.request) {
    const { cookies: _cookies, ...request } = scrubbed.request;
    if (typeof request.url === "string") request.url = scrubUrl(request.url);
    if (request.headers) request.headers = scrubHeaders(request.headers);
    if (typeof request.query_string === "string") request.query_string = scrubString(request.query_string);
    if (request.data !== undefined) request.data = scrubUnknown(request.data);
    scrubbed.request = request;
  }

  if (typeof scrubbed.message === "string") scrubbed.message = scrubString(scrubbed.message);

  if (scrubbed.exception?.values) {
    scrubbed.exception = {
      ...scrubbed.exception,
      values: scrubbed.exception.values.map((value) => ({
        ...value,
        value: typeof value.value === "string" ? scrubString(value.value) : value.value,
      })),
    };
  }

  if (scrubbed.breadcrumbs) scrubbed.breadcrumbs = scrubbed.breadcrumbs.map(scrubBreadcrumb);
  if (scrubbed.extra) scrubbed.extra = scrubRecord(scrubbed.extra);
  if (scrubbed.contexts) scrubbed.contexts = scrubRecord(scrubbed.contexts);
  if (scrubbed.tags) scrubbed.tags = scrubRecord(scrubbed.tags);

  return scrubbed;
}
