// Sentry in the browser. This is the only client-side init (Next.js loads
// instrumentation-client.ts); options are shared with the server and edge
// runtimes, and Sentry is off unless NEXT_PUBLIC_SENTRY_DSN is set.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryOptions } from "@/lib/observability/sentryConfig";

Sentry.init({
  ...buildSentryOptions(),
  // Session Replay records only masked text and no media.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    Sentry.browserTracingIntegration(),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
