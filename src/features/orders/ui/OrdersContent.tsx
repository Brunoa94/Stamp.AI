"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { useUser } from "@/queries/authQueries";
import { useOrders } from "@/queries/orderQueries";
import { useCancelOrder } from "../lib/hooks/useCancelOrder";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import type { OrderWithItemsT } from "@/types/order";
import { useOrdersState } from "../lib/hooks/useOrdersState";
import { OrdersCancelModal } from "./components/OrdersCancelModal/OrdersCancelModal";
import { OrdersDetailsModal } from "./components/OrdersDetailsModal/OrdersDetailsModal";
import "./orders.css";
import { OrdersPagination } from "./components/OrdersPagination";
import { OrdersEmptySection } from "./sections/OrdersEmptySection";
import { OrdersGridSection } from "./sections/OrdersGridSection";
import { OrdersListSection } from "./sections/OrdersListSection";
import { OrdersLoadingSection } from "./sections/OrdersLoadingSection";
import { OrdersFilterSection } from "./sections/OrdersFilterSection/OrdersFilterSection";
import { OrdersLayout } from "./components/OrdersLayout";
import { OrdersHeader } from "./components/OrdersHeader";

export default function OrdersContent() {
  const t = useTranslations("orders.content");
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError,
    refetch,
  } = useOrders(user?.id);
  const isLoading = isUserLoading || isOrdersLoading;
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(
    null,
  );

  const {
    cancelModalOpen,
    orderToCancel,
    isCancelling,
    handleCancelOrder,
    handleCloseCancelModal,
    handleConfirmCancel,
  } = useCancelOrder();

  const {
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    clearFilters,
    activePills,
    isFilterLoading,
    filteredOrders,
    showEmptyState,
    pagination,
    setPage,
  } = useOrdersState(orders);

  if (isError) {
    return (
      <section className="min-h-[calc(100vh-6rem)] bg-(--color-stamp-off-white) px-12 pb-24 pt-12 lg:px-24">
        <div className="rounded-none border border-(--color-stamp-error)/20 bg-(--color-stamp-error)/5 p-8 text-center">
          <Heading
            as="h2"
            variant="card"
            className="text-xl text-(--color-stamp-error)"
          >
            {t("errorTitle")}
          </Heading>
          <Paragraph
            variant="sm"
            className="mt-2 text-sm tracking-normal text-(--color-stamp-error)/80"
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
      </section>
    );
  }

  return (
    <>
      <OrdersLayout header={<OrdersHeader total={filteredOrders.length} />}>
        <section className="min-h-[calc(100vh-6rem)] bg-(--color-stamp-off-white) font-heading text-(--color-stamp-chocolate)">
          <OrdersFilterSection
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            onClearFilters={clearFilters}
            activePills={activePills}
          />

          {(isLoading || isFilterLoading) && <OrdersLoadingSection />}

          {!isLoading &&
            !isFilterLoading &&
            !showEmptyState &&
            viewMode === "list" && (
              <OrdersListSection
                orders={pagination.paginatedOrders}
                onOpenDetails={setSelectedOrder}
                onCancelOrder={handleCancelOrder}
                onReorder={() => router.push("/stamp")}
              />
            )}

          {!isLoading &&
            !isFilterLoading &&
            !showEmptyState &&
            viewMode === "grid" && (
              <OrdersGridSection
                orders={pagination.paginatedOrders}
                startIndex={pagination.startIndex}
                onOpenDetails={setSelectedOrder}
                onCancelOrder={handleCancelOrder}
                onReorder={() => router.push("/stamp")}
              />
            )}

          {!isLoading && !isFilterLoading && showEmptyState && (
            <OrdersEmptySection onInitiate={() => router.push("/stamp")} />
          )}

          {!isLoading && !isFilterLoading && !showEmptyState && (
            <OrdersPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={filteredOrders.length}
              startIndex={pagination.startIndex}
              pageSize={pagination.paginatedOrders.length}
              onPageChange={setPage}
            />
          )}
        </section>
      </OrdersLayout>

      {selectedOrder && (
        <OrdersDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <OrdersCancelModal
        isOpen={cancelModalOpen}
        order={orderToCancel}
        isCancelling={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseCancelModal}
      />
    </>
  );
}
