"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { dashboardTheme } from "@/theme/components";
import { DashboardBackground } from "@/features/dashboard/ui/DashboardBackground";
import { DashboardHeader } from "@/features/dashboard/ui/DashboardHeader";
import { ProfileSummaryCard } from "@/features/dashboard/ui/ProfileSummaryCard";
import { SynthesisMetricsCard } from "@/features/dashboard/ui/SynthesisMetricsCard";
import { ArchiveStorageCard } from "@/features/dashboard/ui/ArchiveStorageCard";
import { CreditsCoinsCard } from "@/features/dashboard/ui/CreditsCoinsCard";
import { QuickAccessCard } from "@/features/dashboard/ui/QuickAccessCard";
import { StampCtaCard } from "@/features/dashboard/ui/StampCtaCard";
import { RecentOrdersCard } from "@/features/dashboard/ui/RecentOrdersCard";
import { PaymentRecoveryBanner } from "@/features/checkout/ui/components/PaymentRecoveryBanner";
import { PageContainer } from "@/shared/ui/PageContainer";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: orders = [] } = useOrders(user?.id);
  const router = useRouter();

  return (
    <ProtectedRoute>
      <DashboardBackground />

      {/* Main Content Section - using global layout pattern */}
      <section className="relative z-10 px-8 lg:px-24 pb-16">
        <PageContainer>
          <DashboardHeader user={user} />

          {/* Payment Recovery Banner - Shows if user has pending payments */}
          <div className="mb-6">
            <PaymentRecoveryBanner
              onRecoveryComplete={(orderId) => {
                router.push(`/orders/${orderId}`);
              }}
            />
          </div>

          <div className={dashboardTheme.page.grid}>
            {/* Left Column */}
            <div className={dashboardTheme.page.leftColumn}>
              <ProfileSummaryCard user={user} />
              <CreditsCoinsCard totalCredits={1240} usedCredits={768} />
              <QuickAccessCard />
            </div>

            {/* Right Column */}
            <div className={dashboardTheme.page.rightColumn}>
              {/* Metrics Row - 2 cards side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <SynthesisMetricsCard ordersPlaced={24} target={30} />
                <ArchiveStorageCard designsCreated={142} archiveLimit={300} />
              </div>

              {/* CTA Card */}
              <StampCtaCard />

              {/* Recent Orders */}
              <RecentOrdersCard orders={orders} />
            </div>
          </div>
        </PageContainer>
      </section>
    </ProtectedRoute>
  );
}
