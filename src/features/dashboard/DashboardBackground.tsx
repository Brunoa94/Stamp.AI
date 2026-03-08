import { dashboardTheme } from "@/theme/components";

export function DashboardBackground() {
  return (
    <>
      <div className="bg-fluid-cluster" aria-hidden="true">
        <div className="dashboard-blob dashboard-blob-purple" />
        <div className="dashboard-blob dashboard-blob-pink" />
        <div className="dashboard-blob dashboard-blob-cyan" />
        <div className="dashboard-blob dashboard-blob-indigo" />
      </div>

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
