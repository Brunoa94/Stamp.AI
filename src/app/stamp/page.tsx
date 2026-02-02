"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import DashboardContent from "@/features/dashboard/dashboardContent/DashboardContent";
import { theme } from "@/theme";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
