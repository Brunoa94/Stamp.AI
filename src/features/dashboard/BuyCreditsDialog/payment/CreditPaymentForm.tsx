"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { type PaymentMethodId } from "@/constants/payment";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { StripeCardForm } from "./StripeCardForm";
import { PayPalPlaceholder } from "./PayPalPlaceholder";

interface CreditPaymentFormProps {
  amount: number;
  credits: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CreditCheckoutForm({
  amount,
  credits,
  onSuccess,
  onError,
}: CreditPaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("stripe");

  return (
    <div className="space-y-4">
      <PaymentMethodSelector
        selected={paymentMethod}
        onSelect={setPaymentMethod}
      />

      {paymentMethod === "stripe" && (
        <StripeCardForm
          amount={amount}
          credits={credits}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}

      {paymentMethod === "paypal" && <PayPalPlaceholder />}
    </div>
  );
}

export function CreditPaymentForm(props: CreditPaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CreditCheckoutForm {...props} />
    </Elements>
  );
}
