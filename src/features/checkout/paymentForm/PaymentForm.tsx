"use client";

import { useState } from "react";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { CheckoutErrorDisplay } from "../components";
import clsx from "clsx";
import { PaymentMethodSelector } from "../PaymentMethodSelector/PaymentMethodSelector";
import { PayPalButton } from "../PayPalButton/PayPalButton";
import { MollieButton } from "../MollieButton";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { PaymentMethodT } from "@/types/payment";
import { TestCardSelector } from "./TestCardSelector";
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
  initialPaymentMethod?: PaymentMethodT;
  onPaymentMethodChange?: (method: PaymentMethodT) => void;
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
  initialPaymentMethod = "stripe",
  onPaymentMethodChange,
}: CheckoutFormProps) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodT>(initialPaymentMethod);

  const {
    loading,
    error,
    setError,
    selectedTestMethod,
    setSelectedTestMethod,
    handleSubmit,
    handlePayPalSuccess,
    stripe,
  } = usePaymentForm({
    amount,
    lineItems,
    shippingAddress,
    testMode,
    // Only trigger Stripe submit when stripe is selected
    triggerSubmit: triggerSubmit && paymentMethod === "stripe",
    onSuccess,
    onError,
    onSubmitComplete,
  });

  const handlePaymentMethodChange = (method: PaymentMethodT) => {
    setPaymentMethod(method);
    setError(null);
    onPaymentMethodChange?.(method);
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onMethodChange={handlePaymentMethodChange}
        disabled={loading}
      />

      {/* Stripe Card Form */}
      {paymentMethod === "stripe" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {testMode ? (
            <TestCardSelector
              value={selectedTestMethod}
              onChange={setSelectedTestMethod}
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

          {error && (
            <CheckoutErrorDisplay
              error={error}
              onDismiss={() => setError(null)}
            />
          )}

          {!hideButton && (
            <Button
              type="submit"
              disabled={!stripe || loading}
              className={clsx(
                "w-full rounded-lg bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest",
              )}
            >
              {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
          )}
        </form>
      )}

      {/* PayPal Buttons (hidden in checkout step; final action is in summary CTA) */}
      {!hideButton && paymentMethod === "paypal" && (
        <PayPalButton
          amount={amount}
          lineItems={lineItems}
          shippingAddress={shippingAddress}
          testMode={testMode}
          onSuccess={handlePayPalSuccess}
          onError={onError}
          disabled={loading}
        />
      )}

      {/* Mollie Button (hidden in checkout step; final action is in summary CTA) */}
      {!hideButton && paymentMethod === "mollie" && (
        <MollieButton
          amount={amount}
          lineItems={lineItems}
          shippingAddress={shippingAddress}
          testMode={testMode}
          onError={onError}
          disabled={loading}
        />
      )}
    </div>
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
