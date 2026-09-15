# Observability

How errors, cron jobs and uptime are monitored, and where to look when
something breaks.

## Sentry projects

| Surface | Init | DSN var | Notes |
| --- | --- | --- | --- |
| Next.js browser | `src/instrumentation-client.ts` | `NEXT_PUBLIC_SENTRY_DSN` | Replay on (text masked, media blocked), 0.1 traces |
| Next.js server / edge runtime | `sentry.server.config.ts`, `sentry.edge.config.ts` (loaded by `src/instrumentation.ts`) | `NEXT_PUBLIC_SENTRY_DSN` | 0.1 traces |
| Supabase edge functions (Deno) | `supabase/functions/_shared/sentry.ts` | `SENTRY_DSN` (Supabase secret) | Errors + cron check-ins only, no tracing |

Shared, unit-tested configuration:

- `src/lib/observability/sentryConfig.ts` — `environment` (from `VERCEL_ENV`,
  then `NODE_ENV`), `release` (from `VERCEL_GIT_COMMIT_SHA`), `enabled` only
  outside `development`, `sendDefaultPii: false`, and the `beforeSend`
  scrubber (`scrubSentryEvent`) that redacts emails, bearer tokens, JWTs, API
  keys, cookies and sensitive keys before an event leaves the process.
- `supabase/functions/_shared/sentryContext.ts` — the edge equivalent: request
  context (method + path only), PII scrubbing of `extra`, environment
  inference and the cron monitor registry.

Traces sample rate is overridable with `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
(0..1). Set `NEXT_PUBLIC_VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` by
enabling "Automatically expose System Environment Variables" in Vercel.

Application code reports through `captureError` / `captureMessage` in
`src/lib/observability/errorCapture.ts` (gated by
`NEXT_PUBLIC_ERROR_CAPTURE_ENABLED`), never through `Sentry.*` directly.

## Edge functions

Every function wraps its handler:

```ts
serve(withErrorReporting(async (req) => { ... }, { functionName: 'stripe-webhook' }))
```

`withErrorReporting`:

1. initialises Sentry once per isolate (no-op without `SENTRY_DSN`);
2. tags events with `function` and `request_id` (`x-request-id` header, or a
   generated `req_*` id that is echoed back on 500 responses);
3. reports uncaught errors, flushes, and answers `500 INTERNAL_ERROR` instead
   of crashing the isolate;
4. sends cron check-ins for functions listed in `CRON_MONITORS` (below).

`handleError()` (`_shared/errors.ts`) forwards unexpected errors and 5xx
`FunctionError`s to Sentry through an injected reporter, so the existing
`catch (error) { return handleError(error, corsHeaders) }` pattern reports with
no per-function code. 4xx client errors are not reported.

`enforceTestMode()` raises a `fatal` Sentry message when a client asks for
test mode in production.

To report something manually inside a function:

```ts
import { captureException, captureMessage } from '../_shared/sentry.ts'

captureException(error, { extra: { order_id } })          // scrubbed automatically
captureMessage('Refund needs manual review', 'warning', { extra: { order_id } })
```

## Cron monitors (Sentry Crons)

Cron-invoked functions (source of truth: `supabase/migrations/*cron*.sql`)
send `in_progress → ok | error` check-ins around every non-preflight run. The
monitor is created/updated automatically from the config in
`supabase/functions/_shared/sentryContext.ts` on the first check-in.

| Function | Monitor slug | Schedule (UTC) | Max runtime |
| --- | --- | --- | --- |
| `sync-printify-orders` | `edge-sync-printify-orders` | `0 */4 * * *` | 10 min |
| `sync-cheapest-providers` | `edge-sync-cheapest-providers` | `0 3 * * *` | 30 min |

Check-in margin is 10 minutes: Sentry alerts when a run does not start within
10 minutes of the schedule, when it runs longer than the max runtime, or when
it ends with `error` (uncaught error or 5xx response).

`process-payment-recovery` is not cron-scheduled — it is invoked by the
client (`src/services/paymentRecoveryService.ts`) — so it only has error
reporting. When adding a new pg_cron job, add its entry to `CRON_MONITORS`
(the test in `src/tests/edge-functions/sentryContext.test.ts` pins schedules
to the migrations) and a row to this table.

The pg_cron jobs `process-catalog-queue`, `daily-price-refresh` and
`stock-availability-check` in older migrations point at functions that no
longer exist in `supabase/functions/`; they are not monitored.

## Uptime monitoring (`/api/health`)

`GET /api/health` (`src/app/api/health/route.ts`) returns:

```json
{ "status": "healthy" | "degraded" | "unhealthy", "timestamp": "...", "version": "...", "uptime": 123, "checks": { "database": {...}, "memory": {...} } }
```

- HTTP `200` for `healthy` and `degraded`, `503` for `unhealthy`.
- `Cache-Control: no-store`, so monitors always hit the origin.

Point an uptime monitor (Sentry Uptime, Better Stack, Checkly, UptimeRobot…) at
`https://<production-domain>/api/health` with:

- method `GET`, interval 1–5 minutes, timeout 10 s;
- success = status code `200` (treat `503` as down);
- optional body assertion: JSON `status` equals `"healthy"` to page on
  degraded database latency as well;
- alert after 2 consecutive failures to ride out a single cold start.

The endpoint queries `profiles` through the anon client, so it also fails when
Supabase is unreachable or RLS/config is broken.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel | Next.js DSN (client, server, edge runtime) |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Vercel | 0..1, default 0.1 |
| `NEXT_PUBLIC_ERROR_CAPTURE_ENABLED` | Vercel | Gate for `errorCapture.ts` |
| `SENTRY_AUTH_TOKEN` | Vercel build | Source map upload (`withSentryConfig`) |
| `SENTRY_DSN` | Supabase secrets | Edge functions DSN |
| `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | Supabase secrets | Optional overrides |
