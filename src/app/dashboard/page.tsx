"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { dashboardTheme } from "@/theme/components";
import { DashboardBackground } from "@/features/dashboard/DashboardBackground";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { ProfileSummaryCard } from "@/features/dashboard/ProfileSummaryCard";
import { QuickPerformanceCard } from "@/features/dashboard/QuickPerformanceCard";
import { CreditsCoinsCard } from "@/features/dashboard/CreditsCoinsCard";
import { QuickAccessCard } from "@/features/dashboard/QuickAccessCard";
import { StampCtaCard } from "@/features/dashboard/StampCtaCard";
import { RecentOrdersCard } from "@/features/dashboard/RecentOrdersCard";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: orders = [] } = useOrders(user?.id);
  const ordersPlaced = orders.length;

  return (
    <ProtectedRoute>
      <div className={dashboardTheme.page.wrapper}>
        <DashboardBackground />
        <main className={dashboardTheme.page.container}>
          <DashboardHeader user={user} />

          <div className={dashboardTheme.page.grid}>
            <div className={dashboardTheme.page.leftColumn}>
              <ProfileSummaryCard user={user} />
              <QuickPerformanceCard
                ordersPlaced={ordersPlaced}
                designsCreated={42}
              />
              <CreditsCoinsCard totalCredits={2450} usedCredits={1592} />
              <QuickAccessCard />
            </div>

            <div className={dashboardTheme.page.rightColumn}>
              <StampCtaCard />
              <RecentOrdersCard orders={orders} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
