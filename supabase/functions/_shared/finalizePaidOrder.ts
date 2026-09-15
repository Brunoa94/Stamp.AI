/**
 * Finalize Paid Order (orchestration)
 *
 * The single server-side path that turns a verified provider payment into a
 * paid order. Used by the finalize-order edge function (called by the checkout
 * return pages), by the Stripe/PayPal webhooks when the browser never
 * finalized, and by process-payment-recovery.
 *
 * All I/O is injected through `FinalizeOrderPortsI` so the flow is testable
 * without Deno; see finalizePaidOrderDeps.ts for the production wiring.
 */

import { FunctionError } from "./errors.ts";
import type { PaidPayment } from "./paymentProof.ts";
import type { LineItemForPricingI } from "./lineItemsForPricing.ts";
import type { OrderTotalsConfigI, OrderTotalsI } from "./orderTotals.ts";
import { reconcileChargedAmount, toPricingMetadata } from "./orderTotals.ts";
import { normalizePromoCode } from "./promoDiscount.ts";
import { buildIdempotencyKey } from "./paymentReference.ts";
import {
  buildOrderInsert,
  buildOrderItemInserts,
  decideExistingOrder,
  generateOrderNumber,
  resolveOrderSourceItems,
  toPricingLineItems,
  type ExistingOrderI,
  type OrderAddressI,
  type OrderInsertI,
  type OrderItemInsertI,
  type OrderSourceI,
  type PaymentProviderT,
} from "./orderFinalization.ts";

export interface PricedOrderI {
  pricing: {
    success: boolean;
    subtotal_cents: number;
    items: Array<LineItemForPricingI & { unit_price_cents: number; total_cents: number; product_name?: string }>;
    errors: string[];
  };
  promo: { code: string; type: string; value: number } | null;
  totals: OrderTotalsI;
}

export interface PriceOrderRequestI {
  lineItems: LineItemForPricingI[];
  promoCode: string | null;
  config: OrderTotalsConfigI;
}

export interface InsertedOrderI {
  id: string;
  order_number: string | null;
}

export interface RecordPaymentTransactionI {
  provider: PaymentProviderT;
  paymentId: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  captureId?: string;
  pricingMetadata: Record<string, string | number | null>;
}

export interface FinalizeOrderPortsI {
  config: OrderTotalsConfigI;
  /** Verify with the provider that the payment succeeded and belongs to the user. */
  verifyPayment(provider: PaymentProviderT, paymentId: string, userId: string): Promise<PaidPayment>;
  /** Reprice from the catalog and compute totals (serverPriceService.priceOrderFromCatalog). */
  priceOrder(request: PriceOrderRequestI): Promise<PricedOrderI>;
  /** Promo code recorded with the payment at intent creation, if any. */
  loadStoredPromoCode(provider: PaymentProviderT, paymentId: string): Promise<string | null>;
  findOrderByIdempotencyKey(key: string): Promise<ExistingOrderI | null>;
  /** Insert the order; resolve null when the idempotency key already exists. */
  insertOrder(order: OrderInsertI): Promise<InsertedOrderI | null>;
  insertOrderItems(items: OrderItemInsertI[]): Promise<void>;
  recordPaymentTransaction(record: RecordPaymentTransactionI): Promise<void>;
  now?: () => number;
  random?: () => number;
}

export interface FinalizeOrderCallerI {
  userId: string;
  userEmail: string;
  isServiceRole: boolean;
}

export interface FinalizeOrderRequestI {
  provider: PaymentProviderT;
  paymentId: string;
  caller: FinalizeOrderCallerI;
  /** Payment owner when a privileged caller finalizes on the customer's behalf. */
  owner?: { userId: string; userEmail: string };
  source: OrderSourceI;
  shippingAddress: OrderAddressI | null;
  billingAddress: OrderAddressI | null;
  /** Caller hint; validated against the promocodes table by priceOrder. */
  promoCode?: string | null;
  /** Expected currency; defaults to the store currency from the totals config. */
  currency?: string | null;
}

export interface FinalizeOrderResultI {
  orderId: string;
  orderNumber: string | null;
  created: boolean;
  totalCents: number | null;
}

function resolveOwner(request: FinalizeOrderRequestI): { userId: string; userEmail: string } {
  if (!request.caller.isServiceRole) {
    return { userId: request.caller.userId, userEmail: request.caller.userEmail };
  }
  if (!request.owner?.userId) {
    throw new FunctionError(400, "OWNER_REQUIRED", "Privileged finalization requires the payment owner");
  }
  return request.owner;
}

function reuse(existing: ExistingOrderI): FinalizeOrderResultI {
  return { orderId: existing.id, orderNumber: existing.order_number ?? null, created: false, totalCents: null };
}

export async function finalizePaidOrder(
  request: FinalizeOrderRequestI,
  ports: FinalizeOrderPortsI,
): Promise<FinalizeOrderResultI> {
  const owner = resolveOwner(request);
  const idempotencyKey = buildIdempotencyKey(request.provider, request.paymentId);

  // 1. Idempotency: one order per provider payment.
  const existing = await ports.findOrderByIdempotencyKey(idempotencyKey);
  if (decideExistingOrder(existing, owner.userId) === "reuse" && existing) {
    return reuse(existing);
  }

  // 2. The order source must be priceable before we spend a provider call.
  const source = resolveOrderSourceItems(request.source);
  if (source.errors.length > 0) {
    throw new FunctionError(400, "INVALID_ORDER_SOURCE", source.errors.join("; "));
  }

  // 3. Proof of payment: succeeded, unrefunded, owned by the customer.
  const payment = await ports.verifyPayment(request.provider, request.paymentId, owner.userId);

  // 4. Reprice everything from the catalog with the server's promo/shipping/VAT rules.
  const promoCode = normalizePromoCode(request.promoCode) ??
    (await ports.loadStoredPromoCode(request.provider, request.paymentId));
  const priced = await ports.priceOrder({
    lineItems: toPricingLineItems(source.items),
    promoCode,
    config: ports.config,
  });

  // 5. The order total must equal what the provider actually charged.
  const expectedCurrency = (request.currency ?? ports.config.currency).toUpperCase();
  const reconciliation = reconcileChargedAmount(priced.totals, payment, expectedCurrency);
  if (!reconciliation.ok) {
    throw new FunctionError(
      402,
      reconciliation.reason ?? "AMOUNT_MISMATCH",
      `Charged ${payment.amount} ${payment.currency} does not match server total ${priced.totals.total_cents} cents ${expectedCurrency}`,
    );
  }

  // 6. Mint the paid order (service role) keyed on the payment.
  const orderInsert = buildOrderInsert(
    {
      provider: request.provider,
      paymentId: request.paymentId,
      userId: owner.userId,
      userEmail: owner.userEmail,
      currency: expectedCurrency,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      promoCode: priced.promo?.code ?? null,
      promoValue: priced.promo?.value ?? null,
    },
    priced.totals,
    generateOrderNumber(ports.now?.(), ports.random?.()),
  );

  const inserted = await ports.insertOrder(orderInsert);
  if (!inserted) {
    // Lost a race with a concurrent finalization for the same payment.
    const winner = await ports.findOrderByIdempotencyKey(idempotencyKey);
    if (winner && decideExistingOrder(winner, owner.userId) === "reuse") {
      return reuse(winner);
    }
    throw new FunctionError(500, "ORDER_CREATE_FAILED", "Order could not be created");
  }

  await ports.insertOrderItems(buildOrderItemInserts(inserted.id, priced.pricing.items, source.items));

  await ports.recordPaymentTransaction({
    provider: request.provider,
    paymentId: request.paymentId,
    userId: owner.userId,
    orderId: inserted.id,
    amount: payment.amount,
    currency: payment.currency,
    captureId: payment.captureId,
    pricingMetadata: { ...toPricingMetadata(priced.totals, promoCode) },
  });

  return {
    orderId: inserted.id,
    orderNumber: inserted.order_number,
    created: true,
    totalCents: priced.totals.total_cents,
  };
}
