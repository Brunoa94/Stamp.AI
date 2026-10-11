import type { OrderT } from "@/shared/types/order";

/**
 * A paid, confirmed order that has not reached Printify yet still needs the
 * fulfilment step. Anything else (sent, failed and refunded, cancelled) is final.
 */
export function needsFulfillment(
  order: Pick<OrderT, "payment_status" | "status" | "printify_order_id">,
): boolean {
  return (
    order.payment_status === "paid" &&
    order.status === "confirmed" &&
    !order.printify_order_id
  );
}

/** create-printify-order answers 409 ALREADY_FULFILLED when the order was already sent. */
export function isAlreadyFulfilledError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "ALREADY_FULFILLED"
  );
}
