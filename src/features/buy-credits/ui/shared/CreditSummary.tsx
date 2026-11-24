"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

interface CreditSummaryProps {
  credits: number;
  price: number;
}

export function CreditSummary({ credits, price }: CreditSummaryProps) {
  const t = useTranslations("buyCredits.summary");

  return (
    <div className="p-4 rounded-xl bg-(--color-stamp-cream) border border-(--color-stamp-divider)">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-(--color-stamp-gold-text)" />
          <Span variant="strong" className="text-(--color-stamp-chocolate)">
            {t("credits", { credits: credits.toLocaleString() })}
          </Span>
        </div>
        <Span variant="total" className="text-(--color-stamp-chocolate)">€{price.toFixed(2)}</Span>
      </div>
    </div>
  );
}
