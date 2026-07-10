/**
 * DashboardMetricCard
 *
 * Single big-number metric with a progress bar toward a target.
 */

import { ReactNode } from "react";
import { Span } from "@/features/ui/span";
import { calculatePercentage } from "../../lib/helpers/calculatePercentage";
import { DashboardCard } from "../components/DashboardCard";
import { DashboardProgressBar } from "../components/DashboardProgressBar";

interface DashboardMetricCardPropsI {
  label: string;
  icon: ReactNode;
  value: number;
  valueCaption: string;
  target: number;
  targetCaption: string;
}

export function DashboardMetricCard({
  label,
  icon,
  value,
  valueCaption,
  target,
  targetCaption,
}: DashboardMetricCardPropsI) {
  const percent = calculatePercentage(value, target);

  return (
    <DashboardCard label={label} icon={icon}>
      <Span
        as="p"
        variant="metric"
        className="text-(--color-stamp-chocolate)"
      >
        {value.toLocaleString()}
      </Span>
      <Span
        as="p"
        variant="micro"
        className="mt-2 text-(--color-stamp-taupe)"
      >
        {valueCaption}
      </Span>

      <div className="mt-8 space-y-3">
        <DashboardProgressBar percent={percent} label={`${label} progress`} />
        <div className="flex items-center justify-between">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {targetCaption} {target.toLocaleString()}
          </Span>
          <Span variant="micro" className="text-(--color-stamp-gold)">
            {percent}%
          </Span>
        </div>
      </div>
    </DashboardCard>
  );
}
