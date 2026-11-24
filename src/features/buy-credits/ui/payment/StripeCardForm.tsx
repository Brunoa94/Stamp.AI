"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useStripePayment } from "../../lib/hooks/useStripePayment";
import { StripeCardInputField } from "./StripeCardInputField";
import { CreditPaymentErrorMessage } from "./CreditPaymentErrorMessage";

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
      <StripeCardInputField />

      {error && <CreditPaymentErrorMessage message={error} />}

      <Button
        type="submit"
        disabled={!isReady || loading}
        variant="primary"
        className="w-full"
      >
        {loading ? t("processing") : t("payButton", { amount: amount.toFixed(2) })}
      </Button>
    </form>
  );
}
