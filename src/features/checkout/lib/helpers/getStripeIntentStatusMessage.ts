type TranslateFn = (key: string) => string;

/**
 * Translation keys under `checkout.paymentForm` for each non-successful
 * Stripe PaymentIntent status. Any status missing from this map (including
 * new statuses Stripe may introduce) resolves to the generic fallback.
 */
const STRIPE_INTENT_STATUS_KEYS: Record<string, string> = {
  processing: "statusProcessing",
  requires_payment_method: "statusRequiresPaymentMethod",
  requires_action: "statusRequiresAction",
  requires_confirmation: "statusRequiresAction",
  requires_capture: "statusProcessing",
  canceled: "statusCanceled",
};

/**
 * Map a non-successful Stripe PaymentIntent status to a user-friendly,
 * translated message. `t` must be scoped to `checkout.paymentForm`.
 */
export function getStripeIntentStatusMessage(
  status: string | undefined,
  t: TranslateFn,
): string {
  const key = status ? STRIPE_INTENT_STATUS_KEYS[status] : undefined;
  return t(key ?? "statusUnknown");
}
