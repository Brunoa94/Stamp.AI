import { useState } from "react";
import { useTranslations } from "next-intl";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ShippingAddressT } from "@/shared/schemas/checkout";
import { mapShippingAddressToBillingDetails } from "@/shared/mappers/mapShippingAddressToBillingDetails";
import type { PrintifyLineItem } from "@/shared/types/printifyOrder";
import { useCreatePaymentIntent } from "@/shared/queries/stripeQueries";
import type { CreatePaymentIntentPayloadI } from "@/shared/types/payment";
import { getStripeIntentStatusMessage } from "@/features/checkout/lib/helpers/getStripeIntentStatusMessage";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { mapAddPaymentInfoEvent } from "@/features/analytics/mappers/ecommerceMappers";

interface UsePaymentFormProps {
  /** Total in cents */
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  /** Applied promo code (server derives the discount from it) */
  promoCode?: string;
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
  promoCode,
  testMode = false,
  onSuccess,
  onError,
}: UsePaymentFormProps) {
  const t = useTranslations("checkout.paymentForm");
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestMethod, setSelectedTestMethod] = useState<string>("visa");
  const isTestMode = testMode === true;
  const createPaymentIntent = useCreatePaymentIntent();
  // Use showToast: false since this form shows inline errors
  const { handleError } = useErrorHandler({ showToast: false });

  const processPayment = async () => {
    if (!stripe) {
      const notReadyMessage = t("stripeNotReady");
      setError(notReadyMessage);
      onError?.(notReadyMessage);
      return;
    }

    if (!elements && !isTestMode) {
      const missingElementMessage = t("formNotReady");
      setError(missingElementMessage);
      onError?.(missingElementMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody: CreatePaymentIntentPayloadI = {
        // The edge function expects major currency units and recomputes the
        // total server-side; this value only has to agree with it.
        amount: amount / 100,
        currency: "eur",
        line_items: lineItems,
        shipping_address: shippingAddress,
        promo_code: promoCode || undefined,
        // Note: order_id is NOT set here because the order doesn't exist yet.
        // The order is created after payment succeeds, then linkPaymentTransactionToOrder
        // sets payment_transactions.order_id which the webhook uses to find the order.
      };

      if (isTestMode) {
        const testPaymentMethod = TEST_PAYMENT_METHODS[
          selectedTestMethod as keyof typeof TEST_PAYMENT_METHODS
        ];
        requestBody.payment_method = testPaymentMethod;
        requestBody.confirm = true;
      }

      const paymentData = await createPaymentIntent.mutateAsync(requestBody);

      const { clientSecret, paymentIntentId } = paymentData;

      if (isTestMode && requestBody.confirm) {
        onSuccess?.(
          {
            id: paymentIntentId,
            status: "succeeded",
            client_secret: clientSecret,
          },
          lineItems,
        );
        return;
      }

      const cardElement = elements!.getElement(CardElement);
      if (!cardElement) {
        throw new Error(t("cardElementNotFound"));
      }

      // Track add_payment_info before confirming payment
      AnalyticsService.track(
        "add_payment_info",
        mapAddPaymentInfoEvent({ lineItems, amount }),
      );

      const { error: confirmError, paymentIntent } = await stripe
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: mapShippingAddressToBillingDetails(
              shippingAddress,
            ),
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess?.(paymentIntent, lineItems);
      } else {
        // Every non-successful backend status must surface a user-friendly
        // message instead of silently doing nothing.
        throw new Error(getStripeIntentStatusMessage(paymentIntent?.status, t));
      }
    } catch (err) {
      // Process error through handler for consistent error code extraction
      const { message: errorMessage } = handleError(err);
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
