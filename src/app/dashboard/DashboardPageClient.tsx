"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardContent } from "@/features/dashboard/ui/DashboardContent";

export default function DashboardPageClient() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
