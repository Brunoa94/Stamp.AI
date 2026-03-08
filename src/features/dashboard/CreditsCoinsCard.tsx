import { Coins } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { SummaryRow } from "@/features/ui/summary-row";

interface CreditsCoinsCardProps {
  totalCredits: number;
  usedCredits: number;
}

export function CreditsCoinsCard({
  totalCredits,
  usedCredits,
}: CreditsCoinsCardProps) {
  const percentage = totalCredits
    ? Math.round((usedCredits / totalCredits) * 100)
    : 0;

  return (
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
            <span className={dashboardTheme.credits.balanceUnit}>Credits</span>
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

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="ghost"
          className={dashboardTheme.credits.actionPrimary}
        >
          Buy More Credits
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={dashboardTheme.credits.actionSecondary}
        >
          View History
        </Button>
      </div>
    </section>
  );
}
