"use client";

"use client";

import React from "react";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { CheckoutErrorDisplay } from "../components";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { usePaymentForm } from "./usePaymentForm";
import { TestCardSelector } from "./TestCardSelector";
import type { PrintifyLineItem } from "@/types/printifyOrder";

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
        <div className="border-2 border-purple-200 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
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
          className={clsx(componentThemes.button.primary, "w-full")}
        >
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      )}
    </form>
  );
};

CheckoutForm.displayName = "CheckoutForm";

const PaymentForm = (props: CheckoutFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;
