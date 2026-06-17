"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Coins, Info } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { BrutalistCard } from "./BrutalistCard";
import { calculatePercentage } from "../lib/helpers/calculatePercentage";

const BuyCreditsDialog = dynamic(
  () =>
    import("@/features/buy-credits/ui/BuyCreditsDialog").then(
      (mod) => mod.BuyCreditsDialog,
    ),
  { ssr: false },
);

interface PropsI {
  totalCredits: number;
  usedCredits: number;
}

export function CreditsCoinsCard({
  totalCredits,
  usedCredits,
}: PropsI) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const percentage = calculatePercentage(usedCredits, totalCredits);

  const handlePurchaseSuccess = (credits: number) => {
    // TODO: Refresh credits data after successful purchase
    console.log(`Successfully purchased ${credits} credits`);
  };

  return (
    <>
      <BrutalistCard accentColor="cyan">
        <div className="flex items-center justify-between mb-6">
          <Span variant="micro" className={dashboardTheme.card.subtitle}>
            AVAILABLE CREDITS
          </Span>
          <Info className="w-4 h-4 text-ink/20" />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-orange" />
            <Span
              variant="default"
              className={dashboardTheme.credits.balanceValue}
            >
              {totalCredits.toLocaleString()}
            </Span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className={dashboardTheme.credits.usageRow}>
            <Span variant="micro" className="text-ink/40">
              USAGE CAPACITY
            </Span>
            <Span variant="micro" className="text-cyan">
              {percentage}% SPENT
            </Span>
          </div>
          <div className={dashboardTheme.credits.progressBar}>
            <div
              className={dashboardTheme.credits.progressFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className={dashboardTheme.credits.actionPrimary}
        >
          Buy More Credits
        </Button>
      </BrutalistCard>

      {isDialogOpen && (
        <BuyCreditsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </>
  );
}
