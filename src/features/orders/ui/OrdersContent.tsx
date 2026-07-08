"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { useCancelOrder } from "../lib/hooks/useCancelOrder";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import type { OrderWithItemsT } from "@/types/order";
import { useOrdersState } from "../lib/hooks/useOrdersState";
import { OrdersCancelModal } from "./components/OrdersCancelModal/OrdersCancelModal";
import { OrdersDetailsModal } from "./components/OrdersDetailsModal/OrdersDetailsModal";
import { OrdersFooter } from "./components/OrdersFooter/OrdersFooter";
import { OrdersHeader } from "./components/OrdersHeader";
import "./orders.css";
import { OrdersPagination } from "./components/OrdersPagination";
import { OrdersEmptySection } from "./sections/OrdersEmptySection";
import { OrdersGridSection } from "./sections/OrdersGridSection";
import { OrdersListSection } from "./sections/OrdersListSection";
import { OrdersLoadingSection } from "./sections/OrdersLoadingSection";
import { OrdersFilterSection } from "./sections/OrdersFilterSection/OrdersFilterSection";

export default function OrdersContent() {
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
      <main className="mx-auto min-h-screen max-w-360 px-6 pb-24 pt-40 md:px-12">
        <div className="rounded-none border border-red-200 bg-red-50 p-8 text-center">
          <Heading as="h2" variant="card" className="text-xl text-red-700">
            Archive Unavailable
          </Heading>
          <Paragraph
            variant="sm"
            className="mt-2 text-sm tracking-normal text-red-600"
          >
            We couldn&apos;t load your protocol records.
          </Paragraph>
          <Button
            onClick={() => refetch()}
            variant="secondary-brown"
            className="mt-6"
          >
            Retry
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="font-(--font-outfit) text-(--color-stamp-chocolate)">
        <OrdersHeader />

        <main className="mx-auto min-h-screen max-w-360 px-6 pb-24 pt-32 md:px-12">
          <OrdersFilterSection
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            onClearFilters={clearFilters}
            activePills={activePills}
            total={filteredOrders.length}
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
        </main>

        <OrdersFooter />
      </div>

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
