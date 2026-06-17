"use client";

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
  return (
    <div>
      <Label className={buyCreditsTheme.sectionLabel}>Select a Package</Label>
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
