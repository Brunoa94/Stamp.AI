import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Stripe.js loaders, one per credential set.
 *
 * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the live key. When checkout runs
 * with the test flag on, `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY` is used
 * instead so the browser-side Elements match the test secret key the edge
 * functions select for `test_mode: true`. If no dedicated test key is set,
 * the live loader is reused (the previous behaviour).
 */
const livePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const testKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
const testPromise: Promise<Stripe | null> = testKey
  ? loadStripe(testKey)
  : livePromise;

export function getStripePromise(testMode = false): Promise<Stripe | null> {
  return testMode ? testPromise : livePromise;
}

/** Live-mode loader kept for callers that never run in test mode. */
export const stripePromise = livePromise;
