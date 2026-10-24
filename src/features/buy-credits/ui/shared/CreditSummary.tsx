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
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#FF8C42]" />
          <Span variant="strong" className="text-slate-900">
            {t("credits", { credits: credits.toLocaleString() })}
          </Span>
        </div>
        <Span variant="total" className="text-slate-900">€{price.toFixed(2)}</Span>
      </div>
    </div>
  );
}
