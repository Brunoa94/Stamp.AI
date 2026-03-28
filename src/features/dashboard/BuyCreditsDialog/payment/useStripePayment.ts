"use client";

import { useState, useCallback } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";

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

  const supabase = createClient();

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("You must be logged in to purchase credits");
        }

        const { data: paymentData, error: paymentError } =
          await supabase.functions.invoke("create-credit-payment", {
            body: {
              amount: amount,
              credits: credits,
              currency: "usd",
            },
          });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (!paymentData?.clientSecret) {
          throw new Error("No payment data received");
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(paymentData.clientSecret, {
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
    [stripe, elements, supabase, amount, credits, onSuccess, onError]
  );

  return {
    loading,
    error,
    isReady: !!stripe,
    handleSubmit,
  };
}
