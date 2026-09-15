/**
 * Stored Order Context
 *
 * When a payment webhook arrives and no order exists yet, the server mints the
 * order itself from what was persisted with the payment, in order of trust:
 *
 *  1. the `payment_recovery` snapshot the checkout page recorded before it
 *     tried to finalize (cart snapshot, Printify line items, address),
 *  2. `payment_transactions.metadata` written by the server at intent creation
 *     (line items, address, promo code),
 *  3. the provider's own metadata (Stripe metadata values are JSON strings).
 *
 * Prices are never read from any of these; every item is repriced from the
 * catalog by finalizePaidOrder. Dependency-free so vitest can import it.
 */

import type { OrderAddressI, OrderSourceCartItemI, OrderSourceI } from "./orderFinalization.ts";
import { normalizePromoCode } from "./promoDiscount.ts";

export interface PaymentRecoveryRowI {
  user_id: string | null;
  user_email?: string | null;
  cart_snapshot?: { cart_items?: unknown; items?: unknown } | null;
  shipping_address?: unknown;
  line_items?: unknown;
  metadata?: Record<string, unknown> | null;
}

export interface StoredOrderContextInputI {
  recovery?: PaymentRecoveryRowI | null;
  /** `payment_transactions.metadata` as written at intent creation. */
  transactionMetadata?: Record<string, unknown> | null;
  /** Stripe `metadata`, PayPal `custom_id` payload or Mollie `metadata`. */
  providerMetadata?: Record<string, unknown> | null;
}

export interface StoredOrderContextI {
  owner: { userId: string; userEmail: string };
  source: OrderSourceI;
  shippingAddress: OrderAddressI | null;
  billingAddress: OrderAddressI | null;
  promoCode: string | null;
  /** True when a payment_recovery row exists and should be marked recovered. */
  recoveryRecorded: boolean;
}

/** Accept a value that is either structured or a JSON string of a structure. */
function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function asArray(value: unknown): Array<Record<string, unknown>> | null {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Array<Record<string, unknown>>) : null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  const parsed = parseMaybeJson(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : null;
}

function asUserId(value: unknown): string | null {
  return typeof value === "string" && value.trim() && value !== "service-role" ? value : null;
}

function asEmail(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function firstDefined<T>(...candidates: Array<T | null | undefined>): T | null {
  for (const candidate of candidates) {
    if (candidate !== null && candidate !== undefined) return candidate;
  }
  return null;
}

/**
 * Rebuild the inputs finalizePaidOrder needs from the stored payment records.
 * Returns null when the owner or the items cannot be determined; the caller
 * then leaves the payment in `payment_recovery` for manual/user recovery.
 */
export function resolveStoredOrderContext(input: StoredOrderContextInputI): StoredOrderContextI | null {
  const recovery = input.recovery ?? null;
  const transaction = input.transactionMetadata ?? {};
  const provider = input.providerMetadata ?? {};

  const userId = firstDefined(
    asUserId(recovery?.user_id),
    asUserId(transaction.user_id),
    asUserId(provider.user_id),
  );
  if (!userId) return null;

  const snapshot = recovery?.cart_snapshot;
  const cartItems = asArray(snapshot?.cart_items) ?? asArray(snapshot?.items);
  const lineItems = firstDefined(
    asArray(recovery?.line_items),
    asArray(transaction.line_items),
    asArray(provider.line_items),
  );
  if (!cartItems && !lineItems) return null;

  return {
    owner: {
      userId,
      userEmail: asEmail(recovery?.user_email) || asEmail(transaction.user_email) || asEmail(provider.user_email),
    },
    source: { cartItems: cartItems as OrderSourceCartItemI[] | null, lineItems },
    shippingAddress: firstDefined(
      asObject(recovery?.shipping_address),
      asObject(transaction.shipping_address),
      asObject(provider.shipping_address),
    ) as OrderAddressI | null,
    billingAddress: null,
    promoCode: normalizePromoCode(
      firstDefined(transaction.promo_code, provider.promo_code, recovery?.metadata?.promo_code),
    ),
    recoveryRecorded: recovery !== null,
  };
}
