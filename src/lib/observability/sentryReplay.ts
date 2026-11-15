import { replayIntegration } from "@sentry/nextjs";

/**
 * Sentry Session Replay, kept in its own module so instrumentation-client.ts
 * can load it after the page starts: Replay is one of the largest parts of
 * the Sentry client and doesn't need to be in every route's first load.
 * Replays record only masked text and no media.
 */
export function createReplayIntegration() {
  return replayIntegration({ maskAllText: true, blockAllMedia: true });
}
