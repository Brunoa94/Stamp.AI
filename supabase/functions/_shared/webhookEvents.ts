/**
 * Webhook delivery deduplication.
 *
 * A delivery is claimed by inserting its (provider, event_id) row; a
 * redelivery finds the row and is skipped. When processing fails the claim
 * is released so the provider's retry is processed instead of being dropped.
 */

import { supabaseRest } from "./supabase.ts";
import type { PaymentProviderT } from "./orderFinalizationRules.ts";

/** Returns false when this event was already processed. */
export async function claimWebhookEvent(
  provider: PaymentProviderT,
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<boolean> {
  const result = await supabaseRest<unknown[]>(
    "webhook_events?on_conflict=provider,event_id",
    "POST",
    { provider, event_id: eventId, event_type: eventType, payload: payload as Record<string, unknown> },
    { prefer: "resolution=ignore-duplicates,return=representation" },
  );
  if (result.error) throw new Error("Could not record the webhook event");
  return Array.isArray(result.data) && result.data.length > 0;
}

export async function releaseWebhookEvent(provider: PaymentProviderT, eventId: string): Promise<void> {
  const result = await supabaseRest(
    `webhook_events?provider=eq.${provider}&event_id=eq.${encodeURIComponent(eventId)}`,
    "DELETE",
  );
  if (result.error) console.error("Could not release the webhook event", { provider, eventId });
}
