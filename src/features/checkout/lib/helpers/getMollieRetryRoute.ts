import { PAYMENT_RETURN_ROUTES } from "../constants/paymentReturn";

/** Mollie retries resume the same cart's checkout when it is known. */
export function getMollieRetryRoute(cartId: string | null): string {
  return cartId
    ? `${PAYMENT_RETURN_ROUTES.checkout}?cartId=${cartId}`
    : PAYMENT_RETURN_ROUTES.cart;
}
