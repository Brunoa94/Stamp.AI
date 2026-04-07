import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";
import { ShippingAddressT } from "@/schemas/checkout";
import { mapShippingAddressToBillingDetails } from "@/mappers/mapShippingAddressToBillingDetails";
import type { PrintifyLineItem } from "@/types/printifyOrder";

interface UsePaymentFormProps {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  orderId?: string;
  testMode?: boolean;
  triggerSubmit?: boolean;
  onSuccess?: (paymentIntent: any, lineItems: PrintifyLineItem[]) => void;
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
  orderId,
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

      const requestBody: any = {
        amount: amount,
        currency: "usd",
        line_items: lineItems,
        shipping_address: shippingAddress,
        metadata: {
          order_id: orderId || `order_${Date.now()}`,
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
        const is3DSFailure =
          confirmError.code === "payment_intent_authentication_failure" ||
          confirmError.type === "card_error" &&
            typeof confirmError.message === "string" &&
            confirmError.message.toLowerCase().includes("authentication");

        const mappedMessage = is3DSFailure
          ? "3D Secure authentication failed. Please try again or use another card."
          : `Card payment failed: ${confirmError.message}`;

        throw new Error(mappedMessage);
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

  // Handle PayPal success - convert to same format as Stripe
  const handlePayPalSuccess = (
    details: { id: string; captureId: string; status: string; payerEmail?: string },
    items: PrintifyLineItem[]
  ) => {
    onSuccess?.(
      {
        id: details.id,
        status: details.status,
        paypal_capture_id: details.captureId,
        paypal_payer_email: details.payerEmail,
      },
      items
    );
  };

  return {
    loading,
    error,
    setError,
    selectedTestMethod,
    setSelectedTestMethod,
    handleSubmit,
    handlePayPalSuccess,
    stripe,
    testPaymentMethods: TEST_PAYMENT_METHODS,
  };
}
