"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import { buyCreditsTheme } from "@/theme/components";
import { CREDIT_PACKAGES } from "@/constants/credits";
import { CreditPackageCard } from "./CreditPackageCard";

interface CreditPackageSelectorProps {
  selectedPackage: number | null;
  onSelect: (credits: number) => void;
}

export function CreditPackageSelector({
  selectedPackage,
  onSelect,
}: CreditPackageSelectorProps) {
  const t = useTranslations("buyCredits.selection");

  return (
    <div>
      <Label className={buyCreditsTheme.sectionLabel}>{t("packageLabel")}</Label>
      <div className={buyCreditsTheme.packageSelector.grid}>
        {CREDIT_PACKAGES.map((pkg) => (
          <CreditPackageCard
            key={pkg.credits}
            package={pkg}
            isSelected={selectedPackage === pkg.credits}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
