"use client";

import { CardElement } from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { STRIPE_CARD_ELEMENT_OPTIONS } from "@/shared/constants/payment";
import { useStripePayment } from "../../lib/hooks/useStripePayment";

interface StripeCardFormProps {
  amount: number;
  credits: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripeCardForm({
  amount,
  credits,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const t = useTranslations("buyCredits.payment");
  const { loading, error, isReady, handleSubmit } = useStripePayment({
    amount,
    credits,
    onSuccess,
    onError,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardInputField />

      {error && <ErrorMessage message={error} />}

      <Button
        type="submit"
        disabled={!isReady || loading}
        variant="gradient"
      >
        {loading ? t("processing") : t("payButton", { amount: amount.toFixed(2) })}
      </Button>
    </form>
  );
}

function CardInputField() {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white/90">
      <CardElement options={STRIPE_CARD_ELEMENT_OPTIONS} />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
      {message}
    </div>
  );
}
