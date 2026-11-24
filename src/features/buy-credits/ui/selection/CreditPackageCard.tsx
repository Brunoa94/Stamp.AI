"use client";

import { Coins } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { CreditPackage } from "@/shared/constants/credits";
import {
  creditOptionCardVariants,
  creditOptionIconVariants,
} from "../../lib/variants/creditOptionVariants";
import { CreditSelectedCheck } from "../shared/CreditSelectedCheck";
import { CreditPopularBadge } from "./CreditPopularBadge";

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
      variant="unstyled"
      onClick={() => onSelect(pkg.credits)}
      aria-pressed={isSelected}
      className={cn(
        creditOptionCardVariants({ selected: isSelected }),
        "flex w-full min-h-26 flex-col items-center justify-center p-4",
      )}
    >
      {pkg.popular && <CreditPopularBadge />}

      <div className="flex items-center gap-1.5 mb-1">
        <Coins
          className={cn("w-5 h-5", creditOptionIconVariants({ selected: isSelected }))}
        />
        <Span variant="credits" className="text-(--color-stamp-chocolate)">
          {pkg.credits}
        </Span>
      </div>

      <Span variant="price" className="text-(--color-stamp-taupe)">€{pkg.price.toFixed(2)}</Span>

      {isSelected && <CreditSelectedCheck className="absolute top-2 right-2" />}
    </Button>
  );
}
