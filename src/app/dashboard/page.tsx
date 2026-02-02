"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { theme } from "@/theme";
import { useUser } from "@/hooks/useAuth";
import { CreateDesignCard, ViewOrdersCard } from "@/features/dashboard/quickActions";

export default function DashboardPage() {
  const { data: user } = useUser();

  return (
    <ProtectedRoute>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className={theme.dashboard.title}>
                Welcome Back, {user?.user_metadata?.first_name || "Creator"}!
              </h1>
              <p className={theme.dashboard.subtitle}>
                Your creative dashboard
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CreateDesignCard />
              <ViewOrdersCard />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
