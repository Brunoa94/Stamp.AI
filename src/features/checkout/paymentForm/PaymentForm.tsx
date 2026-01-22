"use client";

import React, { useState, useEffect } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/client";
import { ShippingAddressT, ProductCustomizationT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { CheckoutErrorDisplay } from "../components";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";

interface CheckoutFormProps {
  amount: number;
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_areas: any[];
    print_provider_id: number;
  }>;
  shippingAddress: ShippingAddressT;
  customization: ProductCustomizationT;
  testMode?: boolean;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
  hideButton?: boolean;
  triggerSubmit?: boolean;
  onSubmitComplete?: () => void;
}

const TEST_PAYMENT_METHODS = {
  visa: "pm_card_visa",
  visa_debit: "pm_card_visa_debit",
  mastercard: "pm_card_mastercard",
  amex: "pm_card_amex",
  discover: "pm_card_discover",
  declined: "pm_card_visa_chargeDeclined",
  insufficient_funds: "pm_card_visa_chargeDeclinedInsufficientFunds",
  expired: "pm_card_chargeDeclinedExpiredCard",
  processing_error: "pm_card_chargeDeclinedProcessingError",
  threeDSecure: "pm_card_threeDSecure2Required",
} as const;

const CheckoutForm = ({
  amount,
  lineItems,
  shippingAddress,
  customization,
  testMode = false,
  onSuccess,
  onError,
  hideButton = false,
  triggerSubmit = false,
  onSubmitComplete,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestMethod, setSelectedTestMethod] =
    useState<string>("visa");

  const supabase = createClient();

    const processPayment = async () => {
      if (!stripe || (!elements && !testMode)) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const requestBody: any = {
          amount: amount,
          currency: "usd",
          line_items: lineItems,
          shipping_address: shippingAddress,
          metadata: {
            order_id: `order_${Date.now()}`,
          },
        };

        if (testMode) {
          const testPaymentMethod =
            TEST_PAYMENT_METHODS[
              selectedTestMethod as keyof typeof TEST_PAYMENT_METHODS
            ];
          requestBody.payment_method = testPaymentMethod;
          requestBody.confirm = true;
        }

        const { data: paymentData, error: paymentError } =
          await supabase.functions.invoke("create-payment-intent", {
            body: requestBody,
          });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (!paymentData) {
          throw new Error("No payment data received");
        }

        const { clientSecret, paymentIntentId } = paymentData;

        if (testMode && requestBody.confirm) {
          onSuccess?.({ id: paymentIntentId, status: "succeeded" });
          return;
        }

        const cardElement = elements!.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                address: {
                  line1: shippingAddress.address1,
                  line2: shippingAddress.address2,
                  city: shippingAddress.city,
                  state: shippingAddress.region,
                  postal_code: shippingAddress.zip,
                  country: shippingAddress.country,
                },
              },
            },
          });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent?.status === "succeeded") {
          onSuccess?.(paymentIntent);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Trigger payment when triggerSubmit prop changes
    useEffect(() => {
      if (triggerSubmit) {
        processPayment().finally(() => {
          onSubmitComplete?.();
        });
      }
    }, [triggerSubmit]);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      await processPayment();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {testMode ? (
          <div className="border-2 border-purple-200 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
            <label
              htmlFor="test-card-select"
              className={componentThemes.text.label}
            >
              Select Test Card
            </label>
            <select
              id="test-card-select"
              value={selectedTestMethod}
              onChange={(e) => setSelectedTestMethod(e.target.value)}
              className={componentThemes.input.base}
            >
              <optgroup label="Successful Payments">
                <option value="visa">Visa (pm_card_visa)</option>
                <option value="visa_debit">
                  Visa Debit (pm_card_visa_debit)
                </option>
                <option value="mastercard">
                  Mastercard (pm_card_mastercard)
                </option>
                <option value="amex">American Express (pm_card_amex)</option>
                <option value="discover">Discover (pm_card_discover)</option>
              </optgroup>
              <optgroup label="Declined Payments">
                <option value="declined">Generic Decline</option>
                <option value="insufficient_funds">Insufficient Funds</option>
                <option value="expired">Expired Card</option>
                <option value="processing_error">Processing Error</option>
              </optgroup>
              <optgroup label="3D Secure">
                <option value="threeDSecure">3D Secure Required</option>
              </optgroup>
            </select>
          </div>
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
          <CheckoutErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
          />
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

/**
 * Payment form wrapper with Stripe Elements provider
 * Uses callback pattern instead of forwardRef for better component composition
 */
const PaymentForm = (props: CheckoutFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;
