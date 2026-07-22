import type { Metadata } from "next";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardContent } from "@/features/dashboard/ui/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Stamp AI",
  description: "View your saved designs and create new custom apparel with AI.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
