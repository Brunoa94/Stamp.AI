"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { formatPrice } from "@/lib/formatPrice";

/**
 * MobilePreviewLayout
 *
 * Mobile flow layout for DesignAdjustmentPanel (mobilePreviewOnly=true).
 * Shows only preview and adjuster without position selector or Disclosures.
 */

interface PropsI {
  preview: ReactNode;
  adjuster: ReactNode;
  supportsAdjustment: boolean;
  totalAdditionalCost: number;
}

export function MobilePreviewLayout({
  preview,
  adjuster,
  supportsAdjustment,
  totalAdditionalCost,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div className="w-full space-y-6">
      {supportsAdjustment && (
        <>
          {preview}
          {adjuster}
        </>
      )}
      {totalAdditionalCost > 0 && (
        <Span variant="micro" className="block text-(--color-stamp-taupe)">
          {t("extraCostSummary", { price: formatPrice(totalAdditionalCost) })}
        </Span>
      )}
    </div>
  );
}
