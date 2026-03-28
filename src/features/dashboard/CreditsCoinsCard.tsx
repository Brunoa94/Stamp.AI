"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Coins } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { SummaryRow } from "@/features/ui/summary-row";

const BuyCreditsDialog = dynamic(
  () => import("./BuyCreditsDialog").then((mod) => mod.BuyCreditsDialog),
  { ssr: false },
);

interface CreditsCoinsCardProps {
  totalCredits: number;
  usedCredits: number;
}

export function CreditsCoinsCard({
  totalCredits,
  usedCredits,
}: CreditsCoinsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const percentage = totalCredits
    ? Math.round((usedCredits / totalCredits) * 100)
    : 0;

  const handlePurchaseSuccess = (credits: number) => {
    // TODO: Refresh credits data after successful purchase
    console.log(`Successfully purchased ${credits} credits`);
  };

  return (
    <>
      <section className={dashboardTheme.card.base}>
        <h4 className={`${dashboardTheme.card.title} mb-6`}>
          Credits &amp; Coins
        </h4>

        <div className="flex items-center gap-4 mb-6">
          <div className={dashboardTheme.credits.iconWrap}>
            <Coins className="text-3xl text-[#FF8C42]" />
          </div>
          <div>
            <span className={dashboardTheme.credits.balanceLabel}>
              Current Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={dashboardTheme.credits.balanceValue}>
                {totalCredits.toLocaleString()}
              </span>
              <span className={dashboardTheme.credits.balanceUnit}>
                Credits
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <SummaryRow
            className={dashboardTheme.credits.usageRow}
            label={`Usage: ${percentage}%`}
            value={`${usedCredits.toLocaleString()} / ${totalCredits.toLocaleString()}`}
            labelClassName="text-gray-500"
            valueClassName="text-gray-400"
          />
          <div className={dashboardTheme.credits.usageTrack}>
            <div
              className="bg-linear-to-r from-[#7C3AED] to-[#06B6D4] h-full shadow-[0_0_12px_rgba(124,58,237,0.4)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="w-full h-12 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
        >
          Buy More Credits
        </Button>
      </section>

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
