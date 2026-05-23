import { dashboardTheme } from "@/theme/components";

export function DashboardBackground() {
  return (
    <>
      {/* Side dividers only - background is provided by FluidInkDriftBackground in root layout */}
      <div
        className={`${dashboardTheme.page.sideDivider} ${dashboardTheme.page.sideDividerLeft}`}
        aria-hidden="true"
      />
      <div
        className={`${dashboardTheme.page.sideDivider} ${dashboardTheme.page.sideDividerRight}`}
        aria-hidden="true"
      />
    </>
  );
}
