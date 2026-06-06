"use client";

import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { TestCardSelector } from "../PaymentForm/TestCardSelector";

interface StripeCardFormProps {
  testMode?: boolean;
  selectedTestMethod?: string;
  onTestMethodChange?: (method: string) => void;
}

/**
 * StripeCardForm - Stripe card input form with test mode support
 * Extracted from PaymentMethodSection for better separation of concerns
 *
 * Encapsulates Stripe Elements provider and CardElement configuration
 */
export function StripeCardForm({
  testMode = false,
  selectedTestMethod = "visa",
  onTestMethodChange,
}: StripeCardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-4">
        {testMode ? (
          <TestCardSelector
            value={selectedTestMethod}
            onChange={onTestMethodChange || (() => {})}
          />
        ) : (
          <div className="border border-slate-200 rounded-lg p-4 bg-white/90">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </Elements>
  );
}
