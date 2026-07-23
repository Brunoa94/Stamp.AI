"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { buyCreditsTheme } from "@/theme/components";
import { CreditSummary } from "../shared/CreditSummary";
import { CreditPaymentForm } from "./CreditPaymentForm";

interface CreditPaymentStepProps {
  credits: number;
  price: number;
  onBack: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function CreditPaymentStep({
  credits,
  price,
  onBack,
  onSuccess,
  onError,
}: CreditPaymentStepProps) {
  const t = useTranslations("buyCredits.payment");

  return (
    <div className={buyCreditsTheme.selectionStep.container}>
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className={buyCreditsTheme.paymentStep.backButton}
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backButton")}
      </Button>

      <CreditSummary credits={credits} price={price} />

      <CreditPaymentForm
        amount={price}
        credits={credits}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
}
