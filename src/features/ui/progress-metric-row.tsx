import { dashboardTheme } from "@/theme/components";

interface ProgressMetricRowProps {
  label: string;
  value: number;
  progress: number;
  barClassName: string;
}

export function ProgressMetricRow({
  label,
  value,
  progress,
  barClassName,
}: ProgressMetricRowProps) {
  return (
    <div>
      <div className={dashboardTheme.performance.metricRow}>
        <span className={dashboardTheme.performance.metricLabel}>{label}</span>
        <span className={dashboardTheme.performance.metricValue}>{value}</span>
      </div>
      <div className={dashboardTheme.performance.progressBar}>
        <div className={barClassName} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
