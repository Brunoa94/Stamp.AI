"use client";

/**
 * DashboardCreditsSection
 *
 * Available credits card: balance, usage bar and the buy-credits dialog.
 * Credits figures are placeholders until a credits query exists.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { CREDITS_PLACEHOLDER } from "../../lib/constants/dashboard";
import { calculatePercentage } from "../../lib/helpers/calculatePercentage";
import { DashboardCard } from "../components/DashboardCard";
import { DashboardProgressBar } from "../components/DashboardProgressBar";

const BuyCreditsDialog = dynamic(
  () =>
    import("@/features/buy-credits/ui/BuyCreditsDialog").then(
      (mod) => mod.BuyCreditsDialog,
    ),
  { ssr: false },
);

export function DashboardCreditsSection() {
  const t = useTranslations("dashboard.credits");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { total, used } = CREDITS_PLACEHOLDER;
  const percentSpent = calculatePercentage(used, total);

  return (
    <DashboardCard
      label={t("label")}
      icon={<Coins className="h-4 w-4 text-(--color-stamp-gold)" />}
    >
      <div className="flex items-baseline gap-3">
        <Span variant="metric" className="text-(--color-stamp-chocolate)">
          {(total - used).toLocaleString()}
        </Span>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("ofTotal", { total: total.toLocaleString() })}
        </Span>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("usageCapacity")}
          </Span>
          <Span variant="micro" className="text-(--color-stamp-chocolate)">
            {t("percentSpent", { percent: percentSpent })}
          </Span>
        </div>
        <DashboardProgressBar percent={percentSpent} label={t("usageLabel")} />
      </div>

      <Button
        type="button"
        variant="secondary-brown"
        className="mt-8 w-full"
        onClick={() => setIsDialogOpen(true)}
      >
        {t("buyMore")}
      </Button>

      {isDialogOpen && (
        <BuyCreditsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </DashboardCard>
  );
}
