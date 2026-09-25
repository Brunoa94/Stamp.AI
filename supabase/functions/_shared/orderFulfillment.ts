import { ErrorCodes } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";

/**
 * Helpers that bind a Printify fulfillment to a paid database order.
 *
 * - The request line items must be exactly the items of the order that was
 *   paid for (same variants, same quantities, nothing more, nothing less).
 * - An order can only be claimed for fulfillment once. The claim sets
 *   `orders.printify_order_id` to the `PENDING_PRINTIFY_ORDER_ID` marker and
 *   is replaced by the real Printify id on success or reset to NULL on failure.
 */

/** Marker stored in orders.printify_order_id while a Printify order is being created. */
export const PENDING_PRINTIFY_ORDER_ID = "pending";

export interface OrderItemQuantityI {
  variant_id: string | number | null | undefined;
  quantity: number | null | undefined;
}

/**
 * Normalize a variant id so the numeric Printify line item id ("42") and the
 * text order_items.variant_id ("42") compare equal. Returns null when the
 * value is not a positive integer.
 */
export function normalizeVariantId(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return String(numeric);
}

function quantitiesByVariant(items: OrderItemQuantityI[]): Map<string, number> | null {
  const totals = new Map<string, number>();
  for (const item of items) {
    const variantId = normalizeVariantId(item.variant_id);
    const quantity = Number(item.quantity ?? 1);
    if (variantId === null || !Number.isInteger(quantity) || quantity <= 0) return null;
    totals.set(variantId, (totals.get(variantId) ?? 0) + quantity);
  }
  return totals;
}

/**
 * True when both lists describe the same multiset of (variant_id, quantity).
 * Quantities of repeated variants are summed on both sides before comparing.
 */
export function lineItemsMatchOrderItems(
  lineItems: OrderItemQuantityI[],
  orderItems: OrderItemQuantityI[],
): boolean {
  if (lineItems.length === 0 || orderItems.length === 0) return false;
  const requested = quantitiesByVariant(lineItems);
  const ordered = quantitiesByVariant(orderItems);
  if (!requested || !ordered || requested.size !== ordered.size) return false;
  for (const [variantId, quantity] of ordered) {
    if (requested.get(variantId) !== quantity) return false;
  }
  return true;
}

export function assertLineItemsMatchOrderItems(
  lineItems: OrderItemQuantityI[],
  orderItems: OrderItemQuantityI[],
): void {
  if (!lineItemsMatchOrderItems(lineItems, orderItems)) {
    throw ErrorCodes.ORDER_LINE_ITEMS_MISMATCH();
  }
}

/**
 * Atomically claim an order for fulfillment. Only succeeds when
 * printify_order_id is still NULL; a concurrent or repeated call gets
 * ORDER_FULFILLMENT_IN_PROGRESS.
 */
export async function claimOrderFulfillment(orderId: string): Promise<void> {
  const result = await supabaseRest<Array<{ id: string }>>(
    `orders?id=eq.${encodeURIComponent(orderId)}&printify_order_id=is.null`,
    "PATCH",
    { printify_order_id: PENDING_PRINTIFY_ORDER_ID, updated_at: new Date().toISOString() },
    { prefer: "return=representation" },
  );
  if (result.error) {
    throw new Error("Could not claim order for fulfillment");
  }
  if (!Array.isArray(result.data) || result.data.length === 0) {
    throw ErrorCodes.ORDER_FULFILLMENT_IN_PROGRESS();
  }
}

/**
 * Store the real Printify order id (success) or clear the claim (failure).
 */
export async function setOrderPrintifyOrderId(orderId: string, printifyOrderId: string | null): Promise<void> {
  const result = await supabaseRest(
    `orders?id=eq.${encodeURIComponent(orderId)}`,
    "PATCH",
    { printify_order_id: printifyOrderId, updated_at: new Date().toISOString() },
  );
  if (result.error) {
    console.error(`Failed to set printify_order_id for order ${orderId}:`, result.error);
    throw new Error("Could not update order fulfillment reference");
  }
}
