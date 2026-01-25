import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";
import { ShippingAddressT } from "@/schemas/checkout";
import { mapShippingAddressToBillingDetails } from "./mappers";

interface UsePaymentFormProps {
  amount: number;
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_areas: Record<string, any[]>;
    print_provider_id: number;
  }>;
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
  triggerSubmit?: boolean;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
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

export function usePaymentForm({
  amount,
  lineItems,
  shippingAddress,
  testMode = false,
  triggerSubmit = false,
  onSuccess,
  onError,
  onSubmitComplete,
}: UsePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestMethod, setSelectedTestMethod] = useState<string>("visa");

  const supabase = createClient();

  const processPayment = async () => {
    if (!stripe || (!elements && !testMode)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in to complete checkout");
      }

      const accessToken = session.access_token;

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
            billing_details: mapShippingAddressToBillingDetails(shippingAddress),
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

  return {
    loading,
    error,
    setError,
    selectedTestMethod,
    setSelectedTestMethod,
    handleSubmit,
    stripe,
    testPaymentMethods: TEST_PAYMENT_METHODS,
  };
}
