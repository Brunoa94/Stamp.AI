"use client";

"use client";

import React from "react";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { CheckoutErrorDisplay } from "../components";
import clsx from "clsx";
import { TestCardSelector } from "./TestCardSelector";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { usePaymentForm } from "./usePaymentForm";

interface CheckoutFormProps {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
  onSuccess?: (paymentIntent: any, lineItems: PrintifyLineItem[]) => void;
  onError?: (error: string) => void;
  hideButton?: boolean;
  triggerSubmit?: boolean;
  onSubmitComplete?: () => void;
}

const CheckoutForm = ({
  amount,
  lineItems,
  shippingAddress,
  testMode = false,
  onSuccess,
  onError,
  hideButton = false,
  triggerSubmit = false,
  onSubmitComplete,
}: CheckoutFormProps) => {
  const {
    loading,
    error,
    setError,
    selectedTestMethod,
    setSelectedTestMethod,
    handleSubmit,
    stripe,
  } = usePaymentForm({
    amount,
    lineItems,
    shippingAddress,
    testMode,
    triggerSubmit,
    onSuccess,
    onError,
    onSubmitComplete,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {testMode ? (
        <TestCardSelector
          value={selectedTestMethod}
          onChange={setSelectedTestMethod}
        />
      ) : (
        <div className="border border-slate-200 rounded-none p-4 bg-white/90">
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

      {error && (
        <CheckoutErrorDisplay error={error} onDismiss={() => setError(null)} />
      )}

      {!hideButton && (
        <Button
          type="submit"
          disabled={!stripe || loading}
          className={clsx(
            "w-full rounded-none bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest",
          )}
        >
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      )}
    </form>
  );
};

const PaymentForm = (props: CheckoutFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;
