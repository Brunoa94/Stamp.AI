/**
 * Fulfillment Guard
 *
 * Before an order is sent to Printify the request is validated against the
 * order the server already verified and stored (finalize-order), never against
 * amounts or items the client supplies. Dependency-free for vitest.
 */

import { FunctionError } from "./errors.ts";

export interface StoredOrderForFulfillmentI {
  id: string;
  user_id: string | null;
  payment_status: string | null;
  status: string | null;
  printify_order_id: string | null;
}

export interface FulfillmentCallerI {
  userId: string;
  isServiceRole: boolean;
}

export interface StoredOrderItemForFulfillmentI {
  variant_id: string | null;
  quantity: number | null;
}

export interface RequestedLineItemI {
  variant_id?: unknown;
  quantity?: unknown;
}

/** Order states in which sending the order to Printify would duplicate or revive it. */
const CLOSED_STATUSES = new Set(["confirmed", "processing", "shipped", "delivered", "cancelled"]);

export function assertOrderFulfillable(order: StoredOrderForFulfillmentI, caller: FulfillmentCallerI): void {
  if (!caller.isServiceRole && order.user_id !== caller.userId) {
    throw new FunctionError(403, "FORBIDDEN", "Order belongs to another user");
  }
  if (order.payment_status !== "paid") {
    throw new FunctionError(402, "ORDER_NOT_PAID", "Order has not been paid");
  }
  if (order.printify_order_id || (order.status && CLOSED_STATUSES.has(order.status))) {
    throw new FunctionError(409, "ORDER_ALREADY_FULFILLED", "Order was already sent to fulfilment or closed");
  }
}

function toQuantity(value: unknown): number {
  if (value === undefined || value === null) return 1;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function quantitiesByVariant(
  items: Array<{ variant_id?: unknown; quantity?: unknown }>,
): Map<string, number> | null {
  const totals = new Map<string, number>();
  for (const item of items) {
    const variantId = item.variant_id === undefined || item.variant_id === null ? "" : String(item.variant_id);
    const quantity = toQuantity(item.quantity);
    if (!variantId || Number.isNaN(quantity)) return null;
    totals.set(variantId, (totals.get(variantId) ?? 0) + quantity);
  }
  return totals;
}

/** The Printify line items must be exactly the variants and quantities that were paid for. */
export function assertLineItemsMatchOrder(
  lineItems: RequestedLineItemI[],
  orderItems: StoredOrderItemForFulfillmentI[],
): void {
  const requested = quantitiesByVariant(lineItems);
  const stored = quantitiesByVariant(orderItems);
  const mismatch = !requested || !stored || stored.size === 0 || requested.size !== stored.size ||
    [...stored].some(([variantId, quantity]) => requested.get(variantId) !== quantity);

  if (mismatch) {
    throw new FunctionError(400, "LINE_ITEMS_MISMATCH", "Line items do not match the paid order");
  }
}
