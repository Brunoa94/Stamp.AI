// Sentry in the browser. This is the only client-side init (Next.js loads
// instrumentation-client.ts); options are shared with the server and edge
// runtimes, and Sentry is off unless NEXT_PUBLIC_SENTRY_DSN is set.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryOptions } from "@/lib/observability/sentryConfig";

Sentry.init({
  ...buildSentryOptions(),
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
});

// Session Replay loads after start, outside every route's first-load JS.
// An error thrown before it arrives is still reported, just without a replay.
if (Sentry.getClient()) {
  void import("@/lib/observability/sentryReplay").then(({ createReplayIntegration }) => {
    Sentry.addIntegration(createReplayIntegration());
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
