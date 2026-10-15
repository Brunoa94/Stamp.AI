"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import { CREDIT_PACKAGES } from "@/shared/constants/credits";
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
      <Label variant="section" className="mb-3 text-slate-500">{t("packageLabel")}</Label>
      <div className="grid grid-cols-2 gap-3">
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
