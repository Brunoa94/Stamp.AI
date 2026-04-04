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
      <div className="flex justify-between items-end mb-2">
        <span className={dashboardTheme.performance.rowLabel}>{label}</span>
        <span className={dashboardTheme.performance.rowValue}>{value}</span>
      </div>
      <div className={dashboardTheme.performance.progressTrack}>
        <div className={barClassName} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
