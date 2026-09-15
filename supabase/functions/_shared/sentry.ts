/**
 * Sentry for Supabase Edge Functions (Deno).
 *
 * Thin glue over the Sentry Deno SDK. Every export is a no-op when
 * `SENTRY_DSN` is unset, so local development and tests never need a DSN.
 * The decisions about WHAT is reported live in the pure, unit-tested
 * `sentryContext.ts`.
 *
 * Secrets (supabase secrets set ...):
 *   SENTRY_DSN           project DSN for the edge-functions Sentry project
 *   SENTRY_ENVIRONMENT   optional override (defaults: DENO_ENV, then inferred)
 *   SENTRY_RELEASE       optional release id (e.g. git sha set at deploy time)
 *
 * Usage:
 *   serve(withErrorReporting(async (req) => { ... }, { functionName: 'my-fn' }))
 */

import * as Sentry from 'npm:@sentry/deno@10.74.0'
import { setErrorReporter } from './errors.ts'
import {
  buildErrorContext,
  getCronMonitor,
  getRequestIdFromHeaders,
  normalizeError,
  resolveEdgeEnvironment,
} from './sentryContext.ts'
import type { CronMonitorI } from './sentryContext.ts'

export type SentryLevelT = 'fatal' | 'error' | 'warning' | 'info'

export interface CaptureContextI {
  functionName?: string
  requestId?: string
  request?: Request
  extra?: Record<string, unknown>
}

export interface WithErrorReportingOptionsI {
  functionName: string
}

type HandlerT = (req: Request) => Promise<Response> | Response

let initialized = false
let enabled = false

/** Idempotent. Returns whether reporting is active (DSN configured). */
export function initSentry(): boolean {
  if (initialized) return enabled
  initialized = true

  const dsn = Deno.env.get('SENTRY_DSN')
  if (!dsn) {
    console.log('SENTRY_DSN not configured, error reporting disabled')
    return false
  }

  const env: Record<string, string | undefined> = {
    SENTRY_ENVIRONMENT: Deno.env.get('SENTRY_ENVIRONMENT'),
    DENO_ENV: Deno.env.get('DENO_ENV'),
    ENVIRONMENT: Deno.env.get('ENVIRONMENT'),
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  }

  Sentry.init({
    dsn,
    environment: resolveEdgeEnvironment(env),
    release: Deno.env.get('SENTRY_RELEASE') || undefined,
    // Errors + cron check-ins only; no performance tracing from edge functions.
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })

  enabled = true
  // Route every handleError() server failure through Sentry as well.
  setErrorReporter((error) => captureException(error))
  return true
}

export function captureException(error: unknown, context: CaptureContextI = {}): string | undefined {
  if (!initSentry()) return undefined

  const built = buildErrorContext({
    functionName: context.functionName ?? currentFunctionName ?? 'unknown',
    requestId: context.requestId ?? currentRequestId ?? undefined,
    request: context.request,
    extra: context.extra,
  })

  return Sentry.captureException(normalizeError(error), {
    tags: built.tags,
    contexts: built.contexts,
    extra: built.extra,
  })
}

export function captureMessage(
  message: string,
  level: SentryLevelT = 'warning',
  context: CaptureContextI = {},
): string | undefined {
  if (!initSentry()) return undefined

  const built = buildErrorContext({
    functionName: context.functionName ?? currentFunctionName ?? 'unknown',
    requestId: context.requestId ?? currentRequestId ?? undefined,
    request: context.request,
    extra: context.extra,
  })

  return Sentry.captureMessage(message, {
    level,
    tags: built.tags,
    contexts: built.contexts,
    extra: built.extra,
  })
}

/** Wait (bounded) for queued events to be delivered before the isolate ends. */
export async function flush(timeoutMs = 2000): Promise<void> {
  if (!enabled) return
  try {
    await Sentry.flush(timeoutMs)
  } catch (error) {
    console.error('Sentry flush failed:', error)
  }
}

// Function name / request id of the request currently being handled. Edge
// isolates process requests concurrently, so these are a best-effort default
// for captures that do not pass their own context.
let currentFunctionName: string | null = null
let currentRequestId: string | null = null

function startCronCheckIn(monitor: CronMonitorI): string | undefined {
  if (!enabled) return undefined
  try {
    return Sentry.captureCheckIn(
      { monitorSlug: monitor.slug, status: 'in_progress' },
      {
        schedule: { type: 'crontab', value: monitor.crontab },
        checkinMargin: 10,
        maxRuntime: monitor.maxRuntimeMinutes,
        timezone: 'Etc/UTC',
      },
    )
  } catch (error) {
    console.error('Sentry check-in failed:', error)
    return undefined
  }
}

function finishCronCheckIn(
  monitor: CronMonitorI,
  checkInId: string | undefined,
  status: 'ok' | 'error',
  startedAt: number,
): void {
  if (!enabled || !checkInId) return
  try {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: monitor.slug,
      status,
      duration: (Date.now() - startedAt) / 1000,
    })
  } catch (error) {
    console.error('Sentry check-in failed:', error)
  }
}

/**
 * Wrap a `serve()` handler so that:
 * - uncaught errors are reported (tagged with function name + request id),
 *   flushed, and turned into a 500 instead of crashing the isolate;
 * - 5xx responses produced by handleError() are already reported through the
 *   reporter hook, so nothing is double counted;
 * - functions listed in CRON_MONITORS send Sentry Cron check-ins
 *   (in_progress → ok/error) around each non-preflight run.
 */
export function withErrorReporting(
  handler: HandlerT,
  options: WithErrorReportingOptionsI,
): (req: Request) => Promise<Response> {
  const monitor = getCronMonitor(options.functionName)

  return async (req: Request): Promise<Response> => {
    initSentry()

    const requestId = getRequestIdFromHeaders(req.headers)
    currentFunctionName = options.functionName
    currentRequestId = requestId

    const isPreflight = req.method === 'OPTIONS'
    const startedAt = Date.now()
    const checkInId = monitor && !isPreflight ? startCronCheckIn(monitor) : undefined

    try {
      const response = await handler(req)

      if (monitor && !isPreflight) {
        finishCronCheckIn(monitor, checkInId, response.status >= 500 ? 'error' : 'ok', startedAt)
      }
      if (response.status >= 500) await flush()

      return response
    } catch (error) {
      console.error(`Unhandled error in ${options.functionName}:`, error)
      captureException(error, {
        functionName: options.functionName,
        requestId,
        request: req,
      })
      if (monitor && !isPreflight) finishCronCheckIn(monitor, checkInId, 'error', startedAt)
      await flush()

      return new Response(JSON.stringify({ error: 'INTERNAL_ERROR' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'x-request-id': requestId },
      })
    }
  }
}
