/**
 * What every payment webhook does once a checkout payment has succeeded:
 * make sure the paid order exists (minting it from the stored payment when
 * the customer never returned to the shop), then issue its invoice.
 */

import { supabaseRest } from "./supabase.ts";
import { tryGenerateInvoiceForOrder } from "./invoice.ts";
import { ensureOrderForPayment } from "./finalizePaidOrder.ts";
import { sendOrderConfirmationEmail } from "./orderEmails.ts";
import { orderIdempotencyKey, type PaymentProviderT } from "./orderFinalizationRules.ts";

interface OrderOwnerRowI {
  id: string;
  user_id: string | null;
}

/**
 * Only the order keyed to this payment counts. A transaction link is not
 * enough: customers may link a payment to a draft order they created, and
 * such a draft must never be marked paid.
 */
async function findSettledOrder(provider: PaymentProviderT, paymentId: string): Promise<OrderOwnerRowI | null> {
  const key = encodeURIComponent(orderIdempotencyKey(provider, paymentId));
  const result = await supabaseRest<OrderOwnerRowI[]>(`orders?idempotency_key=eq.${key}&select=id,user_id`, "GET");
  if (result.error) throw new Error("Could not look up the order");
  return result.data?.[0] ?? null;
}

/** Invoice and confirmation email: both idempotent and never failing the webhook. */
async function afterPaid(orderId: string): Promise<void> {
  await tryGenerateInvoiceForOrder(orderId);
  await sendOrderConfirmationEmail(orderId);
}

/**
 * Returns the paid order id, or null when no order can be built from the
 * payment (logged by ensureOrderForPayment). Infrastructure errors throw so
 * the provider retries the delivery.
 */
export async function settlePaidOrder(provider: PaymentProviderT, paymentId: string): Promise<string | null> {
  const existing = await findSettledOrder(provider, paymentId);
  if (!existing) {
    const minted = await ensureOrderForPayment(provider, paymentId);
    if (minted) await afterPaid(minted.orderId);
    return minted?.orderId ?? null;
  }

  // Only the payment's own customer's order is ever marked paid.
  const ownerFilter = existing.user_id ? `&user_id=eq.${existing.user_id}` : "";
  const update = await supabaseRest(
    `orders?id=eq.${existing.id}${ownerFilter}`,
    "PATCH",
    { payment_status: "paid", payment_method: provider, updated_at: new Date().toISOString() },
  );
  if (update.error) throw new Error("Could not mark the order paid");
  await afterPaid(existing.id);
  return existing.id;
}
