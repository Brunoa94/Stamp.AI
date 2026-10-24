/**
 * Checkout runs in Stripe test mode until live payments are enabled; the
 * test-mode toggle is hidden so customers cannot switch it off.
 *
 * Controlled by `NEXT_PUBLIC_CHECKOUT_TEST_MODE`. Defaults to test mode so a
 * missing variable never starts charging real cards — set it to "false" to
 * go live.
 */
export const CHECKOUT_TEST_MODE =
  process.env.NEXT_PUBLIC_CHECKOUT_TEST_MODE !== "false";
