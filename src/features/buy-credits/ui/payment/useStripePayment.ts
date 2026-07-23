"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { StripeService } from "@/services/stripeService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UseStripePaymentProps {
  amount: number;
  credits: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface UseStripePaymentReturn {
  loading: boolean;
  error: string | null;
  isReady: boolean;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
}

export function useStripePayment({
  amount,
  credits,
  onSuccess,
  onError,
}: UseStripePaymentProps): UseStripePaymentReturn {
  const t = useTranslations("buyCredits.payment");
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use showToast: false since this form shows inline errors
  const { handleError } = useErrorHandler({ showToast: false });

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create payment intent via service
        const { clientSecret } = await StripeService.createCreditPayment({
          amount,
          credits,
          currency: "usd",
        });

        // Get card element for confirmation
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error(t("cardElementNotFound"));
        }

        // Confirm payment with Stripe
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent?.status === "succeeded") {
          onSuccess();
        }
      } catch (err) {
        // Process error through handler for consistent error code extraction
        const { message: errorMessage } = handleError(err);
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [stripe, elements, amount, credits, onSuccess, onError, t]
  );

  return {
    loading,
    error,
    isReady: !!stripe,
    handleSubmit,
  };
}
