"use client";

import { CardElement } from "@stripe/react-stripe-js";
import { STRIPE_CARD_ELEMENT_OPTIONS } from "@/shared/constants/payment";

/** Stripe card element in a stamp input frame. */
export function StripeCardInputField() {
  return (
    <div className="rounded-lg border-2 border-(--color-stamp-taupe)/70 bg-(--color-stamp-white) p-4 transition-colors focus-within:border-(--color-stamp-chocolate)">
      <CardElement options={STRIPE_CARD_ELEMENT_OPTIONS} />
    </div>
  );
}
