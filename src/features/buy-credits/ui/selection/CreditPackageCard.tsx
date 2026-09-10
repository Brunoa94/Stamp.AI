"use client";

import { Coins, Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { buyCreditsTheme } from "@/theme/components";
import type { CreditPackage } from "@/constants/credits";

interface CreditPackageCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: (credits: number) => void;
}

export function CreditPackageCard({
  package: pkg,
  isSelected,
  onSelect,
}: CreditPackageCardProps) {
  const theme = buyCreditsTheme.packageCard;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onSelect(pkg.credits)}
      className={cn(
        theme.base,
        isSelected ? theme.selected : theme.unselected
      )}
    >
      {pkg.popular && <PopularBadge />}

      <div className={theme.creditsRow}>
        <Coins
          className={cn(
            theme.creditsIcon,
            isSelected ? theme.creditsIconSelected : theme.creditsIconUnselected
          )}
        />
        <span
          className={cn(
            theme.creditsValue,
            isSelected ? theme.creditsValueSelected : theme.creditsValueUnselected
          )}
        >
          {pkg.credits}
        </span>
      </div>

      <span className={theme.price}>€{pkg.price.toFixed(2)}</span>

      {isSelected && <SelectedCheckmark />}
    </Button>
  );
}

function PopularBadge() {
  const t = useTranslations("buyCredits.selection");

  return (
    <span className={buyCreditsTheme.popularBadge}>
      <Sparkles className="w-3 h-3" />
      {t("popularBadge")}
    </span>
  );
}

function SelectedCheckmark() {
  return (
    <span className={buyCreditsTheme.selectedCheckmark}>
      <Check className="w-3 h-3" />
    </span>
  );
}
