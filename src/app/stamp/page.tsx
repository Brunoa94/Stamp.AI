"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import WizardDashboardContent from "@/features/dashboard/dashboardContent/WizardDashboardContent";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <WizardDashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
