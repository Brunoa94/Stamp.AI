"use client";

/**
 * DashboardContent
 *
 * Top-level orchestrator for the luxury dashboard: resolves data through
 * useDashboard and branches error / loading / populated states into the
 * layout and sections.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { PaymentRecoveryBanner } from "@/features/checkout/ui/components/PaymentRecoveryBanner";
import type { OrderWithItemsT } from "@/types/order";
import { useDashboard } from "../lib/hooks/useDashboard";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardProfileSection } from "./sections/DashboardProfileSection";
import { DashboardCreditsSection } from "./sections/DashboardCreditsSection";
import { DashboardQuickAccessSection } from "./sections/DashboardQuickAccessSection";
import { DashboardMetricsSection } from "./sections/DashboardMetricsSection";
import { DashboardCtaSection } from "./sections/DashboardCtaSection";
import { DashboardRecentOrdersSection } from "./sections/DashboardRecentOrders/DashboardRecentOrdersSection";
import { DashboardLoadingSection } from "./sections/DashboardLoadingSection";
import "./dashboard.css";

const OrdersDetailsModal = dynamic(
  () =>
    import(
      "@/features/orders/ui/components/OrdersDetailsModal/OrdersDetailsModal"
    ).then((mod) => mod.OrdersDetailsModal),
  { ssr: false },
);

export function DashboardContent() {
  const router = useRouter();
  const t = useTranslations("dashboard.content");
  const {
    user,
    ordersPlaced,
    recentOrders,
    isLoading,
    isError,
    refetch,
  } = useDashboard();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(
    null,
  );

  if (isError) {
    return (
      <DashboardLayout header={<DashboardHeader user={user} />}>
        <div className="border border-(--color-stamp-error)/20 bg-(--color-stamp-error)/5 p-8 text-center">
          <Heading as="h2" variant="card" className="text-(--color-stamp-error)">
            {t("errorTitle")}
          </Heading>
          <Paragraph
            variant="sm"
            className="mt-2 text-(--color-stamp-error)/80"
          >
            {t("errorDescription")}
          </Paragraph>
          <Button
            onClick={() => refetch()}
            variant="primary"
            className="mt-6"
          >
            {t("retry")}
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout header={<DashboardHeader user={user} />}>
        <div className="mb-8">
          <PaymentRecoveryBanner
            onRecoveryComplete={(orderId) => router.push(`/orders/${orderId}`)}
          />
        </div>

        {isLoading ? (
          <DashboardLoadingSection />
        ) : (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="flex flex-col gap-8 xl:col-span-4">
              <DashboardProfileSection user={user} />
              <DashboardCreditsSection />
              <DashboardQuickAccessSection />
            </div>
            <div className="flex flex-col gap-8 xl:col-span-8">
              <DashboardMetricsSection ordersPlaced={ordersPlaced} />
              <DashboardCtaSection />
              <DashboardRecentOrdersSection
                orders={recentOrders}
                totalOrders={ordersPlaced}
                onOpenDetails={setSelectedOrder}
              />
            </div>
          </div>
        )}
      </DashboardLayout>

      {selectedOrder && (
        <OrdersDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
