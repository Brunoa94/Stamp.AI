"use client";

import { Coins, Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { CreditPackage } from "@/shared/constants/credits";

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
  return (
    <Button
      type="button"
      variant="option-card"
      onClick={() => onSelect(pkg.credits)}
      aria-pressed={isSelected}
      className="relative w-full min-h-26 flex flex-col items-center justify-center p-4"
    >
      {pkg.popular && <PopularBadge />}

      <div className="flex items-center gap-1.5 mb-1">
        <Coins
          className={cn(
            "w-5 h-5",
            isSelected ? "text-[#FF8C42]" : "text-slate-400"
          )}
        />
        <Span
          variant="credits"
          className={isSelected ? "text-slate-900" : "text-slate-700"}
        >
          {pkg.credits}
        </Span>
      </div>

      <Span variant="price" className="text-slate-500">€{pkg.price.toFixed(2)}</Span>

      {isSelected && <SelectedCheckmark />}
    </Button>
  );
}

function PopularBadge() {
  const t = useTranslations("buyCredits.selection");

  return (
    <Span variant="pill" className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-full flex items-center gap-1">
      <Sparkles className="w-3 h-3" />
      {t("popularBadge")}
    </Span>
  );
}

function SelectedCheckmark() {
  return (
    <Span unstyled className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center">
      <Check className="w-3 h-3" />
    </Span>
  );
}
