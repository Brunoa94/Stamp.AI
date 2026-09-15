/**
 * Payment Reference
 *
 * Provider + provider payment id identify a purchase everywhere: the
 * `orders.idempotency_key` (`${provider}_${paymentId}`) written when an order
 * is minted, the payment_recovery row, and the checkout return pages.
 *
 * Dependency-free so the browser services and the edge functions share it.
 */

export type PaymentProviderT = "stripe" | "paypal" | "mollie";

export const PAYMENT_PROVIDERS: readonly PaymentProviderT[] = ["stripe", "paypal", "mollie"];

export function isPaymentProvider(value: unknown): value is PaymentProviderT {
  return typeof value === "string" && (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

export interface PaymentReferenceI {
  provider: PaymentProviderT;
  paymentId: string;
}

export function buildIdempotencyKey(provider: PaymentProviderT, paymentId: string): string {
  return `${provider}_${paymentId}`;
}

/** Parse `${provider}_${paymentId}` keys as written by the checkout clients. */
export function parseIdempotencyKey(key: unknown): PaymentReferenceI | null {
  if (typeof key !== "string") return null;
  const separator = key.indexOf("_");
  if (separator <= 0) return null;
  const provider = key.slice(0, separator);
  const paymentId = key.slice(separator + 1);
  if (!isPaymentProvider(provider) || !paymentId) return null;
  return { provider, paymentId };
}
