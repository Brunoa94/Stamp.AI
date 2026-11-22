import type { OrderItemT, OrderStatusHistoryT, OrderT } from "./order";

/** What a guest gives to look up an order on /track-order. */
export interface TrackOrderRequestT {
  orderNumber: string;
  email: string;
}

export type TrackedOrderItemT = Pick<
  OrderItemT,
  "product_name" | "variant_name" | "quantity" | "total_price" | "custom_image_url"
>;

export type TrackedOrderHistoryEntryT = Pick<OrderStatusHistoryT, "status" | "created_at">;

/**
 * The order as a guest sees it on /track-order: status, items, totals and
 * delivery tracking. Never the customer's contact details or addresses, since
 * the lookup only proves knowledge of the order number and email.
 */
export type TrackedOrderT = Pick<
  OrderT,
  | "order_number"
  | "created_at"
  | "status"
  | "printify_status"
  | "payment_status"
  | "currency"
  | "subtotal"
  | "discount_amount"
  | "shipping_cost"
  | "total_amount"
  | "tracking_number"
  | "tracking_url"
  | "shipped_at"
  | "delivered_at"
> & {
  items: TrackedOrderItemT[];
  history: TrackedOrderHistoryEntryT[];
};

/** Error codes of POST /api/track-order, also `orders.track.errors` message keys. */
export type TrackOrderErrorT = "invalidRequest" | "notFound" | "tooManyAttempts" | "lookupFailed";
