import { PAYMENT_RETURN_ROUTES } from "../constants/paymentReturn";

/**
 * Where the payment success page's "Track order" button goes: a registered
 * customer's order list, or the guest tracking page with the order number
 * filled in (guests can't open /orders).
 */
export function getTrackOrderHref(isRegistered: boolean, orderNumber: string | undefined): string {
  if (isRegistered) return PAYMENT_RETURN_ROUTES.orders;
  if (!orderNumber) return PAYMENT_RETURN_ROUTES.trackOrder;

  return `${PAYMENT_RETURN_ROUTES.trackOrder}?order=${encodeURIComponent(orderNumber)}`;
}
