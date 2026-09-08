"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { buyCreditsTheme } from "@/theme/components";
import { CreditPackageSelector } from "./CreditPackageSelector";
import { CustomCreditInput } from "./CustomCreditInput";
import { CreditSummary } from "../shared/CreditSummary";

interface CreditSelectionStepProps {
  selectedPackage: number | null;
  customCredits: string;
  isCustomSelected: boolean;
  finalCredits: number;
  finalPrice: number;
  canProceed: boolean;
  onSelectPackage: (credits: number) => void;
  onSelectCustom: () => void;
  onCustomCreditsChange: (value: string) => void;
  onContinue: () => void;
}

export function CreditSelectionStep({
  selectedPackage,
  customCredits,
  isCustomSelected,
  finalCredits,
  finalPrice,
  canProceed,
  onSelectPackage,
  onSelectCustom,
  onCustomCreditsChange,
  onContinue,
}: CreditSelectionStepProps) {
  const theme = buyCreditsTheme.selectionStep;
  const t = useTranslations("buyCredits.selection");

  return (
    <div className={theme.container}>
      <CreditPackageSelector
        selectedPackage={selectedPackage}
        onSelect={onSelectPackage}
      />

      <CustomCreditInput
        value={customCredits}
        isSelected={isCustomSelected}
        onChange={onCustomCreditsChange}
        onFocus={onSelectCustom}
      />

      {canProceed && (
        <CreditSummary credits={finalCredits} price={finalPrice} />
      )}

      <Button
        type="button"
        onClick={onContinue}
        disabled={!canProceed}
        className={theme.submitButton}
      >
        {t("continueButton")}
      </Button>
    </div>
  );
}
