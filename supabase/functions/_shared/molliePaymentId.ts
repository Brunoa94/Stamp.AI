/**
 * Mollie payment ids look like "tr_WDqYK6vllg": a "tr_" prefix followed by an
 * alphanumeric token. The webhook only receives this id and re-fetches the
 * payment from Mollie, so the id is interpolated into an API path and stored
 * as the webhook event id. Reject anything that does not match the shape.
 *
 * Pure module (no Deno globals) so it can be unit tested from vitest.
 */
const MOLLIE_PAYMENT_ID_PATTERN = /^tr_[A-Za-z0-9]{6,32}$/;

export function isValidMolliePaymentId(value: unknown): value is string {
  return typeof value === "string" && MOLLIE_PAYMENT_ID_PATTERN.test(value);
}
