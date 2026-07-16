/**
 * DashboardMetricsSection
 *
 * Two-up metric grid: orders placed (live count) and designs created
 * (placeholder until a designs query exists).
 */

import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.metrics");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <DashboardMetricCard
        label={t("ordersLabel")}
        icon={<TrendingUp className="h-4 w-4 text-(--color-stamp-taupe)" />}
        value={ordersPlaced}
        valueCaption={t("ordersCaption")}
        target={ORDERS_TARGET}
        targetCaption={t("ordersTarget")}
      />
      <DashboardMetricCard
        label={t("designsLabel")}
        icon={<Box className="h-4 w-4 text-(--color-stamp-taupe)" />}
        value={DESIGNS_PLACEHOLDER.created}
        valueCaption={t("designsCaption")}
        target={DESIGNS_PLACEHOLDER.limit}
        targetCaption={t("designsTarget")}
      />
    </div>
  );
}
