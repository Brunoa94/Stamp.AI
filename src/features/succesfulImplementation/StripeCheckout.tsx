"use client";

import { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/client";

interface CheckoutFormProps {
  amount: number;
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_areas: any[];
    print_provider_id: number;
  }>;
  shippingAddress: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
  };
  testMode?: boolean; // Enable test mode with predefined payment methods
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

// Stripe test payment methods - use these instead of card numbers
const TEST_PAYMENT_METHODS = {
  visa: "pm_card_visa",
  visa_debit: "pm_card_visa_debit",
  mastercard: "pm_card_mastercard",
  amex: "pm_card_amex",
  discover: "pm_card_discover",
  // Special test scenarios
  declined: "pm_card_visa_chargeDeclined",
  insufficient_funds: "pm_card_visa_chargeDeclinedInsufficientFunds",
  expired: "pm_card_chargeDeclinedExpiredCard",
  processing_error: "pm_card_chargeDeclinedProcessingError",
  // 3D Secure
  threeDSecure: "pm_card_threeDSecure2Required",
} as const;

function CheckoutForm({
  amount,
  lineItems,
  shippingAddress,
  testMode = false,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestMethod, setSelectedTestMethod] = useState<string>("visa");

  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || (!elements && !testMode)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build request body
      const requestBody: any = {
        amount: amount,
        currency: "usd",
        line_items: lineItems,
        shipping_address: shippingAddress,
        metadata: {
          order_id: `order_${Date.now()}`,
        },
      };

      // If test mode, use predefined payment method
      if (testMode) {
        const testPaymentMethod =
          TEST_PAYMENT_METHODS[
            selectedTestMethod as keyof typeof TEST_PAYMENT_METHODS
          ];
        requestBody.payment_method = testPaymentMethod;
        requestBody.confirm = true;
      }

      // Create payment intent
      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke("create-payment-intent", {
          body: requestBody,
        });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      const { clientSecret, paymentIntentId } = paymentData;

      // If test mode with auto-confirm, check the status directly
      if (testMode && requestBody.confirm) {
        // Payment was already confirmed server-side
        onSuccess?.({ id: paymentIntentId, status: "succeeded" });
        return;
      }

      // Regular flow: Confirm payment with card element
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

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Information</h3>

        {testMode ? (
          // Test mode: show dropdown with test payment methods
          <div className="border rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                TEST MODE
              </span>
              <span className="text-sm text-gray-600">
                Using test payment methods
              </span>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Test Card
            </label>
            <select
              value={selectedTestMethod}
              onChange={(e) => setSelectedTestMethod(e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700"
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
          // Regular mode: show card element
          <div className="border rounded-lg p-4">
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-lg font-semibold">Total: ${amount.toFixed(2)}</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function StripeCheckout({
  amount,
  lineItems,
  shippingAddress,
  testMode = false,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        lineItems={lineItems}
        shippingAddress={shippingAddress}
        testMode={testMode}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
