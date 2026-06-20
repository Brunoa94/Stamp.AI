export function DashboardBackground() {
  return (
    <>
      {/* Grain overlay */}
      <div className="dashboard-grain-overlay" aria-hidden="true" />

      {/* Background effects */}
      <div className="dashboard-bg-overlay" aria-hidden="true">
        <div className="dashboard-gradient-layer" />
        <div className="dashboard-blob purple" />
        <div className="dashboard-blob cyan" />
        <div className="dashboard-blob orange" />
      </div>
    </>
  );
}
