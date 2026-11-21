import { ErrorCodes, FunctionError } from "./errors.ts";
import { matchesPricedItems, normalizeLineItems, type PricedItemRecordI } from "./checkoutPricingRules.ts";

export interface FulfillableOrderI {
  id: string;
  payment_status: string | null;
  printify_order_id: string | null;
  shipping_address: Record<string, unknown> | null;
}

export interface OrderPaymentI {
  status: string;
  metadata: { priced_items?: PricedItemRecordI[] } | null;
}

/**
 * Checks that an application order may be sent to Printify with these line
 * items, for every caller including the service role: the order is paid, not
 * yet fulfilled, and the items are exactly the ones its payment priced. The
 * address always comes from the order, never from the request.
 */
export function authorizeFulfillment(
  { order, payments, lineItems }: { order: FulfillableOrderI; payments: OrderPaymentI[]; lineItems: unknown },
): { addressTo: Record<string, unknown> } {
  if (!order.shipping_address) throw ErrorCodes.INVALID_REQUEST_BODY();
  if (order.printify_order_id) {
    throw new FunctionError(409, "ALREADY_FULFILLED", "The order was already sent to Printify");
  }

  const requested = normalizeLineItems(lineItems);
  const paid = payments.filter((payment) =>
    payment.status === "succeeded" && Array.isArray(payment.metadata?.priced_items)
  );
  if (!requested || paid.length !== 1 || !matchesPricedItems(requested, paid[0].metadata!.priced_items!)) {
    throw new FunctionError(409, "ITEMS_NOT_PAID", "Requested items do not match the paid checkout");
  }
  if (order.payment_status !== "paid") {
    throw new FunctionError(409, "ORDER_NOT_PAID", "The order has not been paid");
  }

  return { addressTo: order.shipping_address };
}
