import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { ShippingAddressT } from "@/schemas/checkout";
import { mapShippingAddressToBillingDetails } from "@/mappers/mapShippingAddressToBillingDetails";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { useCreatePaymentIntent } from "@/queries";

interface UsePaymentFormProps {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
  onSuccess?: (paymentIntent: any, lineItems: PrintifyLineItem[]) => void;
  onError?: (error: string) => void;
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
  onSuccess,
  onError,
}: UsePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestMethod, setSelectedTestMethod] = useState<string>("visa");
  const isTestMode = testMode === true;
  const createPaymentIntent = useCreatePaymentIntent();

  const processPayment = async () => {
    if (!stripe) {
      const notReadyMessage = "Stripe is not ready yet. Please wait a moment and try again.";
      setError(notReadyMessage);
      onError?.(notReadyMessage);
      return;
    }

    if (!elements && !isTestMode) {
      const missingElementMessage = "Payment form is not ready. Please refresh the page and try again.";
      setError(missingElementMessage);
      onError?.(missingElementMessage);
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

      if (isTestMode) {
        const testPaymentMethod =
          TEST_PAYMENT_METHODS[
            selectedTestMethod as keyof typeof TEST_PAYMENT_METHODS
          ];
        requestBody.payment_method = testPaymentMethod;
        requestBody.confirm = true;
      }

      const paymentData = await createPaymentIntent.mutateAsync(requestBody);

      const { clientSecret, paymentIntentId } = paymentData;

      if (isTestMode && requestBody.confirm) {
        onSuccess?.({ id: paymentIntentId, status: "succeeded" }, lineItems);
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
        onSuccess?.(paymentIntent, lineItems);
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
