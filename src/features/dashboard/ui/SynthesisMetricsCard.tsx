import { TrendingUp } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Span } from "@/features/ui/span";
import { BrutalistCard } from "./BrutalistCard";
import { calculatePercentage } from "../lib/helpers/calculatePercentage";

interface PropsI {
  ordersPlaced: number;
  target?: number;
}

export function SynthesisMetricsCard({
  ordersPlaced,
  target = 30,
}: PropsI) {
  const percentage = calculatePercentage(ordersPlaced, target);

  return (
    <BrutalistCard accentColor="purple">
      <div className="flex items-center justify-between mb-6">
        <Span variant="micro" className={dashboardTheme.card.subtitle}>
          SYNTHESIS METRICS
        </Span>
        <TrendingUp className="w-4 h-4 text-purple" />
      </div>

      <div className="mb-6">
        <Span variant="metric" className="text-ink mb-2 block">
          {ordersPlaced}
        </Span>
        <Span variant="micro" className="text-ink/30">
          ORDERS PLACED
        </Span>
      </div>

      <div className="space-y-2">
        <div className="dashboard-progress-bar">
          <div
            className="dashboard-progress-fill bg-linear-to-r from-purple to-cyan"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <Span variant="micro" className="text-ink/40">
            TARGET {target}
          </Span>
          <Span variant="micro" className="text-green">
            {percentage}% ACHIEVED
          </Span>
        </div>
      </div>
    </BrutalistCard>
  );
}
