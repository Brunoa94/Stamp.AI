/**
 * Webhook Event Claim (pure)
 *
 * `record_webhook_event_atomic` inserts the event or returns the row that was
 * recorded earlier. A row created well before "now" means a duplicate
 * delivery; a row created within the grace window is our own insert echoed
 * back (clock skew between Postgres and the edge runtime). Dependency-free so
 * vitest can cover the decision.
 */

export interface RecordedWebhookEventI {
  created_at?: string | null;
}

export const WEBHOOK_DUPLICATE_GRACE_SECONDS = 5;

export function isDuplicateWebhookEvent(
  recorded: RecordedWebhookEventI | null | undefined,
  nowMs: number = Date.now(),
  graceSeconds: number = WEBHOOK_DUPLICATE_GRACE_SECONDS,
): boolean {
  if (!recorded?.created_at) return false;
  const createdMs = new Date(recorded.created_at).getTime();
  if (Number.isNaN(createdMs)) return false;
  return (nowMs - createdMs) / 1000 > graceSeconds;
}
