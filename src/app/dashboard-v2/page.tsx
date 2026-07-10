"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardContent } from "@/features/dashboard-v2/ui/DashboardContent";

export default function DashboardV2Page() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
