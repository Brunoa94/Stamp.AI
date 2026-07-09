/**
 * CheckoutStripeCardForm
 *
 * Stripe card input restyled to the luxury brutalist system. Wraps Stripe
 * Elements and the shared CardElement; in test mode it uses the stamp-styled
 * test-card selector so predefined test scenarios remain available.
 */

"use client";

import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
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
    <Elements stripe={stripePromise}>
      <div className="mt-6">
        {testMode ? (
          <CheckoutTestCardSelector
            value={selectedTestMethod}
            onChange={onTestMethodChange || (() => {})}
          />
        ) : (
          <div className="border border-(--color-stamp-divider) bg-(--color-stamp-white) p-4">
            <CardElement options={buildCardElementOptions()} />
          </div>
        )}
      </div>
    </Elements>
  );
}
