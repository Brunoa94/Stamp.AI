import { TrendingUp } from "lucide-react";
import { dashboardTheme } from "@/theme/components";

interface PropsI {
  ordersPlaced: number;
  target?: number;
}

export function SynthesisMetricsCard({
  ordersPlaced,
  target = 30,
}: PropsI) {
  const percentage = Math.min(100, Math.round((ordersPlaced / target) * 100));

  return (
    <section className={`${dashboardTheme.card.basePurple} hover:shadow-[0_20px_40px_rgba(147,51,234,0.1)]`}>
      {/* Header with Icon */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">
          SYNTHESIS METRICS
        </span>
        <TrendingUp className="w-5 h-5 text-purple shadow-sm" />
      </div>

      {/* Large Number Display */}
      <h3 className="font-anton text-5xl mb-2 text-ink">{ordersPlaced}</h3>
      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-8">
        ORDERS PLACED
      </p>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-concrete">
          <div
            className="h-full bg-purple shadow-[0_0_10px_rgba(147,51,234,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase">
          <span>TARGET {target}</span>
          <span className="text-purple">{percentage}% ACHIEVED</span>
        </div>
      </div>
    </section>
  );
}
