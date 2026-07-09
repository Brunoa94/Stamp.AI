/**
 * CheckoutV2StripeCardForm
 *
 * Stripe card input restyled to the luxury brutalist system. Wraps Stripe
 * Elements and the shared CardElement; in test mode it reuses the shared
 * TestCardSelector so predefined test scenarios remain available.
 */

"use client";

import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { STRIPE_CARD_ELEMENT_OPTIONS } from "@/constants/payment";
import { TestCardSelector } from "@/features/checkout/ui/PaymentForm/TestCardSelector";

interface CheckoutV2StripeCardFormPropsI {
  testMode?: boolean;
  selectedTestMethod?: string;
  onTestMethodChange?: (method: string) => void;
}

export function CheckoutV2StripeCardForm({
  testMode = false,
  selectedTestMethod = "visa",
  onTestMethodChange,
}: CheckoutV2StripeCardFormPropsI) {
  return (
    <Elements stripe={stripePromise}>
      <div className="mt-6">
        {testMode ? (
          <TestCardSelector
            value={selectedTestMethod}
            onChange={onTestMethodChange || (() => {})}
          />
        ) : (
          <div className="border border-(--color-stamp-divider) bg-(--color-stamp-white) p-4">
            <CardElement options={STRIPE_CARD_ELEMENT_OPTIONS} />
          </div>
        )}
      </div>
    </Elements>
  );
}
