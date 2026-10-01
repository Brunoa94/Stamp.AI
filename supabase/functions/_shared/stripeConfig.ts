import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { ErrorCodes } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";

/**
 * Stripe credential mode.
 *
 * - `live`: production keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
 * - `test`: Stripe Test Mode keys (`STRIPE_TEST_SECRET_KEY`,
 *   `STRIPE_TEST_WEBHOOK_SECRET`). Test keys only ever produce test
 *   payments, so a caller can request this mode safely; if the test keys
 *   are not configured in the deployment the request is rejected instead
 *   of silently falling back to live credentials.
 */
export type StripeModeT = "live" | "test";

/** Key stored in PaymentIntent / payment_transactions metadata. */
export const STRIPE_MODE_METADATA_KEY = "stripe_mode";

/** Query-string parameter the webhook reads to pick its signing secret. */
export const STRIPE_MODE_QUERY_PARAM = "mode";

const TRUTHY = new Set(["true", "1", "yes", "test"]);

/**
 * Resolve the requested mode from a client-supplied flag.
 * Accepts booleans and common string spellings; anything else is `live`.
 */
export function resolveStripeMode(testMode: unknown): StripeModeT {
  if (testMode === true) return "test";
  if (typeof testMode === "string" && TRUTHY.has(testMode.trim().toLowerCase())) {
    return "test";
  }
  return "live";
}

/** Resolve the mode a PaymentIntent (or payment row) was created in. */
export function stripeModeFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): StripeModeT {
  return resolveStripeMode(metadata?.[STRIPE_MODE_METADATA_KEY]);
}

/** Resolve the mode from the webhook request URL (`?mode=test`). */
export function stripeModeFromUrl(url: string): StripeModeT {
  return resolveStripeMode(new URL(url).searchParams.get(STRIPE_MODE_QUERY_PARAM));
}

export function getStripeSecretKey(mode: StripeModeT): string {
  if (mode === "test") {
    const key = Deno.env.get("STRIPE_TEST_SECRET_KEY");
    if (!key) throw ErrorCodes.STRIPE_TEST_SECRET_KEY_MISSING();
    return key;
  }
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw ErrorCodes.STRIPE_SECRET_KEY_MISSING();
  return key;
}

export function getStripeWebhookSecret(mode: StripeModeT): string {
  if (mode === "test") {
    const secret = Deno.env.get("STRIPE_TEST_WEBHOOK_SECRET");
    if (!secret) throw ErrorCodes.STRIPE_TEST_WEBHOOK_SECRET_MISSING();
    return secret;
  }
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw ErrorCodes.STRIPE_WEBHOOK_SECRET_MISSING();
  return secret;
}

/**
 * Verified Stripe events carry `livemode`. A mismatch means the event was
 * signed with the right secret but delivered to the wrong endpoint mode,
 * which must never be processed.
 */
export function assertStripeLivemode(mode: StripeModeT, livemode: boolean): void {
  const expectedLivemode = mode === "live";
  if (livemode !== expectedLivemode) {
    throw ErrorCodes.STRIPE_MODE_MISMATCH(mode, livemode);
  }
}

export function createStripeClient(
  mode: StripeModeT,
  apiVersion: "2023-10-16" | "2024-06-20" = "2024-06-20",
): Stripe {
  return new Stripe(getStripeSecretKey(mode), {
    // deno-lint-ignore no-explicit-any
    apiVersion: apiVersion as any,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * Look up the mode a stored payment was created in. The mode is persisted
 * in `payment_transactions.metadata` by create-payment-intent so that
 * later server-side operations (refunds, payment proof) never have to
 * trust a client-supplied flag. Unknown payments default to `live`.
 */
export async function resolveStripeModeForPaymentIntent(
  paymentIntentId: string,
): Promise<StripeModeT> {
  const result = await supabaseRest<Array<{ metadata: Record<string, unknown> | null }>>(
    `payment_transactions?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}&select=metadata&limit=1`,
    "GET",
  );
  if (result.error) return "live";
  return stripeModeFromMetadata(result.data?.[0]?.metadata);
}
