/**
 * The single server-side path that turns a verified payment into a paid order.
 *
 * Used by the finalize-order function (checkout return pages) and by the
 * payment webhooks, so an order exists even when the customer closes the tab.
 * Totals and items come from the server pricing stored on the payment
 * transaction and the charge is re-verified with the provider.
 */

import { FunctionError } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";
import { verifyPaidPayment } from "./verifyPaidPayment.ts";
import {
  buildOrderItemRows,
  buildOrderRow,
  chargeMatchesPricing,
  generateOrderNumber,
  matchCartItems,
  orderIdempotencyKey,
  parseCartSnapshotItems,
  parseAddress,
  parseStoredPricing,
  parseVatRateBps,
  paymentReferenceColumn,
  type CartItemRowI,
  type OrderAddressI,
  type PaymentProviderT,
} from "./orderFinalizationRules.ts";

export interface FinalizePaidOrderRequestI {
  provider: PaymentProviderT;
  paymentId: string;
  /** The authenticated customer; omitted for server callers (webhooks). */
  callerUserId?: string;
  /** Cart snapshot rows being bought; they must be exactly the paid items. */
  cartItems?: unknown;
  shippingAddress?: unknown;
  billingAddress?: unknown;
}

export interface FinalizedOrderI {
  orderId: string;
  orderNumber: string | null;
  created: boolean;
}

interface PaymentTransactionRowI {
  id: string;
  user_id: string | null;
  order_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface OrderRefI {
  id: string;
  order_number: string | null;
  idempotency_key: string | null;
}

const CART_ITEM_COLUMNS = "id,product_id,variant_id,quantity,product_name,variant_name,custom_image_url";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findOrderByKey(key: string): Promise<OrderRefI | null> {
  const result = await supabaseRest<OrderRefI[]>(
    `orders?idempotency_key=eq.${encodeURIComponent(key)}&select=id,order_number,idempotency_key`,
    "GET",
  );
  if (result.error) throw new Error("Could not look up the order");
  return result.data?.[0] ?? null;
}

async function loadTransaction(provider: PaymentProviderT, paymentId: string): Promise<PaymentTransactionRowI> {
  const result = await supabaseRest<PaymentTransactionRowI[]>(
    `payment_transactions?${paymentReferenceColumn(provider)}=eq.${encodeURIComponent(paymentId)}&select=id,user_id,order_id,metadata`,
    "GET",
  );
  if (result.error) throw new Error("Could not load the payment transaction");
  const rows = result.data ?? [];
  if (rows.length !== 1) throw new FunctionError(404, "PAYMENT_NOT_FOUND", "No checkout payment recorded for this reference");
  return rows[0];
}

/** Display data for webhook-built orders: the checkout cart stored with the payment. */
async function loadCheckoutCartItems(userId: string, metadata: Record<string, unknown>): Promise<CartItemRowI[]> {
  const cartId = metadata.cartId ?? metadata.cart_id;
  if (typeof cartId !== "string" || !UUID_PATTERN.test(cartId)) return [];
  const result = await supabaseRest<CartItemRowI[]>(
    `cart_items?cart_id=eq.${cartId}&select=${CART_ITEM_COLUMNS},carts!inner(user_id)&carts.user_id=eq.${encodeURIComponent(userId)}`,
    "GET",
  );
  if (result.error) throw new Error("Could not load cart items");
  return result.data ?? [];
}

async function insertOrder(row: Record<string, unknown>): Promise<OrderRefI | null> {
  const result = await supabaseRest<OrderRefI[]>("orders", "POST", row, { prefer: "return=representation" });
  if (result.status === 409) return null; // idempotency key taken by a concurrent finalization
  if (result.error || !result.data?.[0]) throw new Error("Could not create the order");
  return result.data[0];
}

async function insertOrderItems(orderId: string, rows: Array<Record<string, unknown>>): Promise<void> {
  const result = await supabaseRest("order_items", "POST", rows);
  if (!result.error) return;
  // Without its items the order is unusable; remove it so a retry can rebuild it.
  await supabaseRest(`orders?id=eq.${orderId}`, "DELETE");
  throw new Error("Could not create the order items");
}

async function linkTransaction(transactionId: string, orderId: string): Promise<void> {
  const result = await supabaseRest(
    `payment_transactions?id=eq.${transactionId}`,
    "PATCH",
    { order_id: orderId, updated_at: new Date().toISOString() },
  );
  if (result.error) console.error("Could not link payment transaction to order", { transactionId, orderId });
}

function existing(order: OrderRefI): FinalizedOrderI {
  return { orderId: order.id, orderNumber: order.order_number, created: false };
}

export async function finalizePaidOrder(request: FinalizePaidOrderRequestI): Promise<FinalizedOrderI> {
  const { provider, paymentId, callerUserId } = request;
  const key = orderIdempotencyKey(provider, paymentId);

  const transaction = await loadTransaction(provider, paymentId);
  const ownerId = transaction.user_id;
  if (!ownerId) throw new FunctionError(409, "PAYMENT_WITHOUT_OWNER", "The payment has no customer");
  if (callerUserId && callerUserId !== ownerId) {
    throw new FunctionError(403, "FORBIDDEN", "Payment does not belong to this user");
  }

  const already = await findOrderByKey(key);
  if (already) return existing(already);
  if (transaction.order_id) {
    throw new FunctionError(409, "PAYMENT_ALREADY_LINKED", "The payment already belongs to another order");
  }

  const metadata = transaction.metadata ?? {};
  const pricing = parseStoredPricing(metadata);
  if (!pricing) throw new FunctionError(409, "PRICING_MISSING", "The payment was not priced by the server");

  const paid = await verifyPaidPayment(provider, paymentId, ownerId);
  if (!chargeMatchesPricing(paid.amount, paid.currency, pricing)) {
    throw new FunctionError(409, "AMOUNT_MISMATCH", "The amount charged does not match the priced order");
  }

  let items;
  if (request.cartItems !== undefined) {
    const snapshot = parseCartSnapshotItems(request.cartItems);
    if (!snapshot) throw new FunctionError(400, "INVALID_CART_ITEMS", "Invalid cart items");
    items = matchCartItems(pricing.items, snapshot, true);
  } else {
    items = matchCartItems(pricing.items, await loadCheckoutCartItems(ownerId, metadata), false);
  }
  if (!items) throw new FunctionError(409, "ITEMS_NOT_PAID", "The cart items do not match the paid checkout");

  const shippingAddress: OrderAddressI | null = parseAddress(request.shippingAddress) ?? parseAddress(metadata.shipping_address);
  const userEmail = typeof metadata.user_email === "string" ? metadata.user_email : "";
  const customerEmail = shippingAddress?.email || userEmail;
  if (!customerEmail) throw new FunctionError(400, "MISSING_CUSTOMER_EMAIL", "No customer email for the order");

  const order = await insertOrder(buildOrderRow({
    provider,
    paymentId,
    userId: ownerId,
    customerEmail,
    shippingAddress,
    billingAddress: parseAddress(request.billingAddress),
    pricing,
    vatRateBps: parseVatRateBps(Deno.env.get("ORDER_VAT_RATE_BPS")),
    orderNumber: generateOrderNumber(Date.now(), Math.random()),
  }));
  if (!order) {
    const winner = await findOrderByKey(key);
    if (!winner) throw new Error("Concurrent order finalization left no order");
    return existing(winner);
  }

  await insertOrderItems(order.id, buildOrderItemRows(order.id, items));
  await linkTransaction(transaction.id, order.id);
  return { orderId: order.id, orderNumber: order.order_number, created: true };
}

/**
 * Webhook entry point: make sure a paid order exists for this payment.
 * Business rejections (unpriced legacy payment, mismatch) are logged and
 * return null; infrastructure failures throw so the provider retries.
 */
export async function ensureOrderForPayment(provider: PaymentProviderT, paymentId: string): Promise<FinalizedOrderI | null> {
  try {
    return await finalizePaidOrder({ provider, paymentId });
  } catch (error) {
    if (error instanceof FunctionError && error.status < 500) {
      console.warn(`No order finalized for ${provider} payment ${paymentId}: ${error.errorId}`);
      return null;
    }
    throw error;
  }
}
