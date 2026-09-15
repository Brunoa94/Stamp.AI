/**
 * Pure helpers behind `_shared/sentry.ts`.
 *
 * Kept free of Deno globals and remote imports so the Vitest suite in
 * src/tests/edge-functions/sentryContext.test.ts can import it directly.
 * Everything that decides WHAT gets reported (tags, request context, PII
 * scrubbing, cron monitor slugs) lives here; the Deno SDK glue stays thin.
 */

export type EnvRecordT = Record<string, string | undefined>

export interface ErrorContextInputI {
  functionName: string
  requestId?: string
  request?: Request
  extra?: Record<string, unknown>
}

export interface ErrorContextI {
  tags: Record<string, string>
  contexts: Record<string, Record<string, unknown>>
  extra: Record<string, unknown>
}

export interface CronMonitorI {
  /** Sentry monitor slug (see docs/OBSERVABILITY.md). */
  slug: string
  /** Schedule as configured in supabase/migrations/*cron*.sql. */
  crontab: string
  /** Sentry flags the run as failed when it exceeds this. */
  maxRuntimeMinutes: number
}

/**
 * Functions invoked by pg_cron (source of truth: supabase/migrations/*cron*.sql).
 * process-payment-recovery is NOT cron-invoked — it is called by the client
 * (src/services/paymentRecoveryService.ts) — so it has no monitor.
 */
export const CRON_MONITORS: Record<string, CronMonitorI> = {
  'sync-printify-orders': {
    slug: 'edge-sync-printify-orders',
    crontab: '0 */4 * * *',
    maxRuntimeMinutes: 10,
  },
  'sync-cheapest-providers': {
    slug: 'edge-sync-cheapest-providers',
    crontab: '0 3 * * *',
    maxRuntimeMinutes: 30,
  },
}

export function getCronMonitor(functionName: string): CronMonitorI | null {
  return CRON_MONITORS[functionName] ?? null
}

/**
 * Environment name reported to Sentry. Mirrors testModeSafeguard's
 * production detection so both agree on what "production" means.
 */
export function resolveEdgeEnvironment(env: EnvRecordT): string {
  const explicit = env.SENTRY_ENVIRONMENT || env.DENO_ENV || env.ENVIRONMENT
  if (explicit) return explicit

  const supabaseUrl = env.SUPABASE_URL || ''
  if (supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
    return 'production'
  }
  return 'development'
}

export function getRequestIdFromHeaders(headers: Headers): string {
  const existing = headers.get('x-request-id') || headers.get('sb-request-id')
  if (existing) return existing
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `req_${timestamp}_${random}`
}

// ─── PII scrubbing ───────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g
const SECRET_KEY_PATTERN = /\b(?:sk|rk|pk)[-_](?:live|test)?[-_]?[A-Za-z0-9]{8,}/g
const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|api[-_]?key|apikey|authorization|cookie|session|credit[-_]?card|card[-_]?number|cvv)/i

const REDACTED = '[redacted]'

export function scrubString(value: string): string {
  return value
    .replace(BEARER_PATTERN, `Bearer ${REDACTED}`)
    .replace(JWT_PATTERN, '[jwt]')
    .replace(SECRET_KEY_PATTERN, '[secret]')
    .replace(EMAIL_PATTERN, '[email]')
}

function scrubUnknown(value: unknown): unknown {
  if (typeof value === 'string') return scrubString(value)
  if (Array.isArray(value)) return value.map(scrubUnknown)
  if (value && typeof value === 'object') return scrubContext(value as Record<string, unknown>)
  return value
}

/** Redact sensitive keys and mask emails/tokens in every string, recursively. */
export function scrubContext(context: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!context) return {}
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : scrubUnknown(value)
  }
  return result
}

/**
 * Build the Sentry capture context for an edge function failure.
 * Only method + path are recorded from the request: no query string, no
 * headers, no body — webhooks carry signatures and payment payloads.
 */
export function buildErrorContext(input: ErrorContextInputI): ErrorContextI {
  const tags: Record<string, string> = { function: input.functionName }
  if (input.requestId) tags.request_id = input.requestId

  const contexts: ErrorContextI['contexts'] = {}
  if (input.request) {
    let path = input.request.url
    try {
      path = new URL(input.request.url).pathname
    } catch {
      // keep the raw value if it is not a valid URL
    }
    contexts.request = { method: input.request.method, path }
  }

  return { tags, contexts, extra: scrubContext(input.extra) }
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error(String(error))
  }
}
