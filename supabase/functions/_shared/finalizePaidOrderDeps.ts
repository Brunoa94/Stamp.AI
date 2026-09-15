/**
 * Finalize Paid Order — production wiring (Deno)
 *
 * Binds the pure `finalizePaidOrder` flow to the provider verifiers, the
 * catalog price service and the service-role REST client. Also exposes
 * `finalizeOrderFromPaymentRecords`, used by the webhooks and the recovery
 * function to mint an order from the stored payment context without ever
 * waiting on the browser.
 */

import { FunctionError } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";
import { verifyPaidPayment } from "./verifyPaidPayment.ts";
import { priceOrderFromCatalog } from "./serverPriceService.ts";
import { getOrderTotalsConfig } from "./orderTotalsEnv.ts";
import { normalizePromoCode } from "./promoDiscount.ts";
import { tryGenerateInvoiceForOrder } from "./invoice.ts";
import { buildIdempotencyKey, type PaymentProviderT } from "./paymentReference.ts";
import type { ExistingOrderI } from "./orderFinalization.ts";
import {
  finalizePaidOrder,
  type FinalizeOrderPortsI,
  type FinalizeOrderResultI,
  type InsertedOrderI,
  type RecordPaymentTransactionI,
} from "./finalizePaidOrder.ts";
import { resolveStoredOrderContext, type PaymentRecoveryRowI } from "./storedOrderContext.ts";

const SERVICE_CALLER = { userId: "service-role", userEmail: "service@system.internal", isServiceRole: true };

const PROVIDER_ID_COLUMN: Record<PaymentProviderT, string> = {
  stripe: "stripe_payment_intent_id",
  paypal: "paypal_order_id",
  mollie: "mollie_payment_id",
};

interface PaymentTransactionRowI {
  id: string;
  order_id: string | null;
  metadata: Record<string, unknown> | null;
}

export async function loadPaymentTransaction(
  provider: PaymentProviderT,
  paymentId: string,
): Promise<PaymentTransactionRowI | null> {
  const result = await supabaseRest<PaymentTransactionRowI[]>(
    `payment_transactions?${PROVIDER_ID_COLUMN[provider]}=eq.${encodeURIComponent(paymentId)}&select=id,order_id,metadata&limit=1`,
    "GET",
  );
  if (result.error) throw new Error("Could not load payment transaction");
  return result.data?.[0] ?? null;
}

async function loadPaymentRecovery(
  provider: PaymentProviderT,
  paymentId: string,
): Promise<PaymentRecoveryRowI | null> {
  const result = await supabaseRest<PaymentRecoveryRowI[]>(
    `payment_recovery?payment_provider=eq.${provider}&payment_intent_id=eq.${encodeURIComponent(paymentId)}&select=user_id,user_email,cart_snapshot,shipping_address,line_items,metadata&limit=1`,
    "GET",
  );
  if (result.error) throw new Error("Could not load payment recovery record");
  return result.data?.[0] ?? null;
}

export async function findOrderByIdempotencyKey(key: string): Promise<ExistingOrderI | null> {
  const result = await supabaseRest<ExistingOrderI[]>(
    `orders?idempotency_key=eq.${encodeURIComponent(key)}&select=id,order_number,user_id,payment_status&limit=1`,
    "GET",
  );
  if (result.error) throw new Error("Could not check existing order");
  return result.data?.[0] ?? null;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

async function recordPaymentTransaction(record: RecordPaymentTransactionI): Promise<void> {
  const existing = await loadPaymentTransaction(record.provider, record.paymentId);
  const metadata = { ...(existing?.metadata ?? {}), ...record.pricingMetadata, order_id: record.orderId };
  const currency = record.currency.toLowerCase();

  const call = record.provider === "stripe"
    ? supabaseRest("rpc/upsert_stripe_payment_transaction", "POST", {
      p_stripe_payment_intent_id: record.paymentId,
      p_user_id: record.userId,
      p_stripe_customer_id: null,
      p_amount: record.amount,
      p_currency: currency,
      p_status: "succeeded",
      p_payment_method_type: null,
      p_metadata: metadata,
      p_order_id: record.orderId,
    })
    : record.provider === "paypal"
    ? supabaseRest("rpc/upsert_paypal_payment_transaction", "POST", {
      p_paypal_order_id: record.paymentId,
      p_user_id: record.userId,
      p_order_id: record.orderId,
      p_amount: record.amount,
      p_currency: currency,
      p_status: "succeeded",
      p_paypal_capture_id: record.captureId ?? null,
      p_metadata: metadata,
    })
    : supabaseRest("rpc/upsert_mollie_payment_transaction", "POST", {
      p_mollie_payment_id: record.paymentId,
      p_user_id: record.userId,
      p_order_id: record.orderId,
      p_amount: record.amount,
      p_currency: currency,
      p_status: "succeeded",
      p_metadata: metadata,
    });

  const result = await call;
  if (result.error) {
    // The order is already minted and paid; the transaction link is repaired
    // by the webhook, so log instead of failing the customer's checkout.
    console.error("Failed to record payment transaction for order", record.orderId, result.error);
  }
}

/** Production ports for finalizePaidOrder. */
export function createFinalizeOrderPorts(): FinalizeOrderPortsI {
  return {
    config: getOrderTotalsConfig(),
    verifyPayment: (provider, paymentId, userId) => verifyPaidPayment(provider, paymentId, userId),
    priceOrder: (request) => priceOrderFromCatalog(request),
    loadStoredPromoCode: async (provider, paymentId) => {
      const transaction = await loadPaymentTransaction(provider, paymentId);
      return normalizePromoCode(transaction?.metadata?.promo_code);
    },
    findOrderByIdempotencyKey,
    insertOrder: async (order): Promise<InsertedOrderI | null> => {
      const result = await supabaseRest<InsertedOrderI[]>("orders", "POST", { ...order }, {
        prefer: "return=representation",
      });
      if (result.error) {
        if (isUniqueViolation(result.error)) return null;
        console.error("Order insert failed:", result.error);
        throw new FunctionError(500, "ORDER_CREATE_FAILED", "Order could not be created");
      }
      const inserted = result.data?.[0];
      if (!inserted?.id) throw new FunctionError(500, "ORDER_CREATE_FAILED", "Order could not be created");
      return { id: inserted.id, order_number: inserted.order_number ?? order.order_number };
    },
    insertOrderItems: async (items) => {
      const result = await supabaseRest("order_items", "POST", items.map((item) => ({ ...item })));
      if (result.error) {
        console.error("Order items insert failed:", result.error);
        throw new FunctionError(500, "ORDER_ITEMS_CREATE_FAILED", "Order items could not be created");
      }
    },
    recordPaymentTransaction,
  };
}

export interface ChargedPaymentI {
  amount: number;
  currency: string;
}

export interface FinalizeFromRecordsInputI {
  provider: PaymentProviderT;
  paymentId: string;
  /** Provider metadata from the webhook event (Stripe metadata, PayPal custom_id, Mollie metadata). */
  providerMetadata?: Record<string, unknown> | null;
  /** What the provider charged; used to leave a recovery row when the order cannot be rebuilt. */
  charged?: ChargedPaymentI | null;
}

/**
 * Mint the order for a paid payment from the stored context (recovery
 * snapshot, transaction metadata, provider metadata). Returns the order when
 * one exists or was created, or null when nothing usable was stored — in that
 * case a `payment_recovery` row is left behind for the recovery flow.
 *
 * Throws when the stored context exists but cannot be finalized (unpriceable
 * items, amount mismatch); callers log and keep the recovery row pending.
 */
export async function finalizeOrderFromPaymentRecords(
  input: FinalizeFromRecordsInputI,
): Promise<FinalizeOrderResultI | null> {
  const { provider, paymentId } = input;

  const existing = await findOrderByIdempotencyKey(buildIdempotencyKey(provider, paymentId));
  if (existing) {
    return { orderId: existing.id, orderNumber: existing.order_number ?? null, created: false, totalCents: null };
  }

  const [recovery, transaction] = await Promise.all([
    loadPaymentRecovery(provider, paymentId),
    loadPaymentTransaction(provider, paymentId),
  ]);
  const context = resolveStoredOrderContext({
    recovery,
    transactionMetadata: transaction?.metadata,
    providerMetadata: input.providerMetadata,
  });

  if (!context) {
    await leaveRecoveryRow(input, transaction?.metadata ?? {});
    return null;
  }

  try {
    const result = await finalizePaidOrder(
      {
        provider,
        paymentId,
        caller: SERVICE_CALLER,
        owner: context.owner,
        source: context.source,
        shippingAddress: context.shippingAddress,
        billingAddress: context.billingAddress,
        promoCode: context.promoCode,
      },
      createFinalizeOrderPorts(),
    );

    if (context.recoveryRecorded) {
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: paymentId,
        p_payment_provider: provider,
        p_order_id: result.orderId,
      });
    }
    if (result.created) await tryGenerateInvoiceForOrder(result.orderId);
    return result;
  } catch (error) {
    if (context.recoveryRecorded) {
      await supabaseRest("rpc/increment_recovery_attempt", "POST", {
        p_payment_intent_id: paymentId,
        p_payment_provider: provider,
        p_error: error instanceof Error ? error.message : String(error),
      });
    } else {
      await leaveRecoveryRow(input, transaction?.metadata ?? {});
    }
    throw error;
  }
}

/** Keep the paid-but-orderless payment visible to the recovery flow. */
async function leaveRecoveryRow(
  input: FinalizeFromRecordsInputI,
  transactionMetadata: Record<string, unknown>,
): Promise<void> {
  const provider = input.providerMetadata ?? {};
  const userId = [transactionMetadata.user_id, provider.user_id].find(
    (value) => typeof value === "string" && value && value !== "service-role",
  ) as string | undefined;
  if (!userId || !input.charged) {
    console.error(`No order and no recoverable context for ${input.provider} payment ${input.paymentId}`);
    return;
  }

  const result = await supabaseRest("rpc/record_payment_for_recovery", "POST", {
    p_payment_provider: input.provider,
    p_payment_intent_id: input.paymentId,
    p_payment_status: "succeeded",
    p_user_id: userId,
    p_user_email: (transactionMetadata.user_email ?? provider.user_email ?? "") as string,
    p_amount: input.charged.amount,
    p_currency: input.charged.currency,
    p_cart_snapshot: null,
    p_shipping_address: transactionMetadata.shipping_address ?? provider.shipping_address ?? null,
    p_line_items: transactionMetadata.line_items ?? provider.line_items ?? null,
    p_metadata: { idempotency_key: buildIdempotencyKey(input.provider, input.paymentId), source: "webhook" },
  });
  if (result.error) console.error("Failed to record payment for recovery:", result.error);
}
