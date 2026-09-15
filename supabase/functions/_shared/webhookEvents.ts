import { supabaseRest } from "./supabase.ts";
import { isDuplicateWebhookEvent, type RecordedWebhookEventI } from "./webhookEventClaim.ts";

export type WebhookProviderT = "stripe" | "paypal" | "mollie";

/**
 * Atomically record a webhook event and report whether it was already
 * processed. Recording and checking happen in one statement so two
 * concurrent deliveries cannot both pass the check.
 */
export async function claimWebhookEvent(
  provider: WebhookProviderT,
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<{ duplicate: boolean }> {
  const result = await supabaseRest<RecordedWebhookEventI>("rpc/record_webhook_event_atomic", "POST", {
    p_provider: provider,
    p_event_id: eventId,
    p_event_type: eventType,
    p_payload: payload,
  });

  if (result.error) {
    // Never drop a payment event because bookkeeping failed; process it and
    // rely on the downstream upserts being idempotent.
    console.error(`Failed to record ${provider} webhook event ${eventId}:`, result.error);
    return { duplicate: false };
  }

  return { duplicate: isDuplicateWebhookEvent(result.data) };
}
