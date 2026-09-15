// Sentry browser initialisation. Next.js 16 loads this file on the client;
// it is the ONLY client-side Sentry config (sentry.client.config.ts was
// removed — it was never loaded).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryBaseOptions } from "@/lib/observability/sentryConfig";

// NEXT_PUBLIC_* values are inlined at build time; access them literally.
Sentry.init({
  ...buildSentryBaseOptions({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    commitSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  }),

  enableLogs: true,
  debug: false,

  // Session Replay: always on errors, 10% of healthy sessions. Text is masked
  // and media blocked so replays never contain customer data.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
