// Sentry initialisation for the Node.js server runtime (API routes, RSC).
// Loaded from src/instrumentation.ts. Shared options (DSN, environment,
// release, sampling, PII scrubbing) live in src/lib/observability/sentryConfig.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryBaseOptions } from "@/lib/observability/sentryConfig";

Sentry.init({
  ...buildSentryBaseOptions({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    vercelEnv: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  }),

  enableLogs: true,
});
