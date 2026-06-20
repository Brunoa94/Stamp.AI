"use client";

import { useState, useCallback } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { StripeService } from "@/services/stripeService";

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
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          throw new Error("Card element not found");
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
        const errorMessage =
          err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [stripe, elements, amount, credits, onSuccess, onError]
  );

  return {
    loading,
    error,
    isReady: !!stripe,
    handleSubmit,
  };
}
