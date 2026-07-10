/**
 * DashboardMetricsSection
 *
 * Two-up metric grid: orders placed (live count) and designs created
 * (placeholder until a designs query exists).
 */

import { Box, TrendingUp } from "lucide-react";
import {
  DESIGNS_PLACEHOLDER,
  ORDERS_TARGET,
} from "../../lib/constants/dashboard";
import { DashboardMetricCard } from "./DashboardMetricCard";

interface DashboardMetricsSectionPropsI {
  ordersPlaced: number;
}

export function DashboardMetricsSection({
  ordersPlaced,
}: DashboardMetricsSectionPropsI) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <DashboardMetricCard
        label="Synthesis metrics"
        icon={<TrendingUp className="h-4 w-4 text-(--color-stamp-taupe)" />}
        value={ordersPlaced}
        valueCaption="Orders placed"
        target={ORDERS_TARGET}
        targetCaption="Target"
      />
      <DashboardMetricCard
        label="Archive storage"
        icon={<Box className="h-4 w-4 text-(--color-stamp-taupe)" />}
        value={DESIGNS_PLACEHOLDER.created}
        valueCaption="Designs created"
        target={DESIGNS_PLACEHOLDER.limit}
        targetCaption="Limit"
      />
    </div>
  );
}
