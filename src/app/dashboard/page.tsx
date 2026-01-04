"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardContent from "@/components/dashboard/dashboardContent/DashboardContent";
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