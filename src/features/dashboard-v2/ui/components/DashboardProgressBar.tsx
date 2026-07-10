/**
 * DashboardProgressBar
 *
 * Flat hairline progress track with a gold fill, shared by the credits
 * and metric cards. Inline width style is required for the dynamic value.
 */

interface DashboardProgressBarPropsI {
  percent: number;
  label: string;
}

export function DashboardProgressBar({
  percent,
  label,
}: DashboardProgressBarPropsI) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full bg-(--color-stamp-cream)"
    >
      <div
        className="h-full bg-(--color-stamp-gold) transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
