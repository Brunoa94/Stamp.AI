"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { buyCreditsTheme } from "@/theme/components";

interface CreditSummaryProps {
  credits: number;
  price: number;
}

export function CreditSummary({ credits, price }: CreditSummaryProps) {
  const theme = buyCreditsTheme.summary;
  const t = useTranslations("buyCredits.summary");

  return (
    <div className={theme.container}>
      <div className={theme.row}>
        <div className={theme.creditsWrap}>
          <Coins className={theme.creditsIcon} />
          <span className={theme.creditsLabel}>
            {t("credits", { credits: credits.toLocaleString() })}
          </span>
        </div>
        <span className={theme.priceValue}>€{price.toFixed(2)}</span>
      </div>
    </div>
  );
}
