/**
 * Checkout runs in Stripe test mode until live payments are enabled: the card
 * form offers predefined test payment methods and payments use the Stripe test
 * keys.
 *
 * Controlled by `NEXT_PUBLIC_CHECKOUT_TEST_MODE`. Defaults to test mode so a
 * missing variable never starts charging real cards — set it to "false" to
 * go live. The edge functions only accept test payments while their
 * `CHECKOUT_TEST_MODE` secret is "true", so keep the two in step.
 */
export const CHECKOUT_TEST_MODE =
  process.env.NEXT_PUBLIC_CHECKOUT_TEST_MODE !== "false";
