import { dashboardTheme } from "@/theme/components";
import { ProgressMetricRow } from "@/features/ui/progress-metric-row";

interface QuickPerformanceCardProps {
  ordersPlaced: number;
  designsCreated: number;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function QuickPerformanceCard({
  ordersPlaced,
  designsCreated,
}: QuickPerformanceCardProps) {
  const ordersProgress = clampPercent(Math.round((ordersPlaced / 32) * 100));
  const designsProgress = clampPercent(Math.round((designsCreated / 64) * 100));

  return (
    <section className={dashboardTheme.card.base}>
      <h4 className={`${dashboardTheme.card.title} mb-6`}>Quick Performance</h4>

      <div className="space-y-6">
        <ProgressMetricRow
          label="Orders Placed"
          value={ordersPlaced}
          progress={ordersProgress}
          barClassName="bg-[#7C3AED] h-full shadow-[0_0_10px_rgba(124,58,237,0.5)]"
        />

        <ProgressMetricRow
          label="Designs Created"
          value={designsCreated}
          progress={designsProgress}
          barClassName="bg-[#06B6D4] h-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        />
      </div>
    </section>
  );
}
