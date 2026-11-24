/**
 * CheckoutStripeCardForm
 *
 * Stripe card input in a rounded-lg field frame (chocolate focus outline,
 * since the card iframe can't draw its own). Wraps Stripe Elements and the
 * shared CardElement; in test mode it uses the stamp-styled
 * test-card selector so predefined test scenarios remain available.
 */

"use client";

import { Elements, CardElement } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe";
import { buildCardElementOptions } from "../../../lib/helpers/stripeCardOptions";
import { CheckoutTestCardSelector } from "./CheckoutTestCardSelector";

interface CheckoutStripeCardFormPropsI {
  testMode?: boolean;
  selectedTestMethod?: string;
  onTestMethodChange?: (method: string) => void;
}

export function CheckoutStripeCardForm({
  testMode = false,
  selectedTestMethod = "visa",
  onTestMethodChange,
}: CheckoutStripeCardFormPropsI) {
  return (
    <Elements stripe={getStripePromise(testMode)}>
      <div className="mt-6">
        {testMode ? (
          <CheckoutTestCardSelector
            value={selectedTestMethod}
            onChange={onTestMethodChange || (() => {})}
          />
        ) : (
          <div className="rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-stamp-chocolate)">
            <CardElement options={buildCardElementOptions()} />
          </div>
        )}
      </div>
    </Elements>
  );
}
