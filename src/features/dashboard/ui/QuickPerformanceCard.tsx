import { dashboardTheme } from "@/theme/components";
import { Span } from "@/features/ui/span";
import { BrutalistCard } from "./BrutalistCard";
import { clampPercent } from "../lib/helpers/clampPercent";

interface PropsI {
  ordersPlaced: number;
  designsCreated: number;
}

export function QuickPerformanceCard({
  ordersPlaced,
  designsCreated,
}: PropsI) {
  const ordersProgress = clampPercent(Math.round((ordersPlaced / 32) * 100));
  const designsProgress = clampPercent(
    Math.round((designsCreated / 200) * 100),
  );

  return (
    <>
      {/* Orders Placed Card - Cyan accent */}
      <BrutalistCard accentColor="cyan">
        <Span variant="micro" className={dashboardTheme.card.subtitle}>
          BUSINESS METRICS
        </Span>

        <div className={dashboardTheme.performance.metricRow}>
          <Span variant="micro" className={dashboardTheme.performance.metricLabel}>
            ORDERS PLACED
          </Span>
          <Span variant="metric" className="text-ink">
            {ordersPlaced}
          </Span>
        </div>

        <div className={dashboardTheme.performance.progressBar}>
          <div
            className={`${dashboardTheme.performance.progressFill} bg-linear-to-r from-purple to-cyan`}
            style={{ width: `${ordersProgress}%` }}
          />
        </div>
      </BrutalistCard>

      {/* Designs Created Card - Cyan accent */}
      <BrutalistCard accentColor="cyan">
        <Span variant="micro" className={dashboardTheme.card.subtitle}>
          CREATIVE OUTPUT
        </Span>

        <div className={dashboardTheme.performance.metricRow}>
          <Span variant="micro" className={dashboardTheme.performance.metricLabel}>
            DESIGNS CREATED
          </Span>
          <Span variant="metric" className="text-ink">
            {designsCreated}
          </Span>
        </div>

        <div className={dashboardTheme.performance.progressBar}>
          <div
            className={`${dashboardTheme.performance.progressFill} bg-linear-to-r from-cyan to-purple`}
            style={{ width: `${designsProgress}%` }}
          />
        </div>
      </BrutalistCard>
    </>
  );
}
