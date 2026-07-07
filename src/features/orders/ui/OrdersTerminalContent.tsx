/**
 * Orders Terminal Content Component
 *
 * Main content component for the orders terminal feature.
 * Handles data fetching, filtering, pagination, and state management.
 * Follows FSD pattern and design system guidelines.
 */

"use client";

import { useCallback, useState } from "react";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { usePagination } from "@/hooks/usePagination";
import { OrderWithItemsT } from "@/types/order";
import { OrdersLoadingSkeleton } from "@/features/orders/ui/components/OrdersStates/OrdersLoadingSkeleton";
import { OrdersErrorState } from "@/features/orders/ui/components/OrdersStates/OrdersErrorState";
import { OrdersEmptyState } from "@/features/orders/ui/components/OrdersStates/OrdersEmptyState";
import { useOrderFilters } from "@/features/orders/lib/hooks/useOrderFilters";
import { useCancelOrder } from "@/features/orders/lib/hooks/useCancelOrder";
import { Alert, AlertDescription } from "@/features/ui/alert";
import dynamic from "next/dynamic";
import { CancelOrderModal } from "./components/CancelOrderModal/CancelOrderModal";
import { PageContainer } from "@/shared/ui/PageContainer";
import { OrdersTerminalHeader } from "@/features/orders/ui/components/OrdersTerminalHeader";
import { OrdersTerminalTable } from "@/features/orders/ui/components/OrdersTerminalTable";
import { OrdersTerminalPagination } from "@/features/orders/ui/components/OrdersTerminalPagination";
import { OrdersViewModeType } from "@/features/orders/types/orders-terminal";

const OrderDetailsModal = dynamic(
  () => import("./components/OrderDetails/OrderDetailsModal/OrderDetailsModal"),
  {
    ssr: false,
  },
);

/**
 * Main content component for orders terminal
 * Handles all order display logic, filtering, and pagination
 */
export default function OrdersTerminalContent() {
  const [viewMode, setViewMode] = useState<OrdersViewModeType>("list");

  const { data: user } = useUser();
  const { data: orders, isLoading, error, refetch } = useOrders(user?.id);
  const { state, filteredOrders, openOrderModal, closeOrderModal } =
    useOrderFilters(orders);

  const {
    cancelModalOpen,
    orderToCancel,
    isCancelling,
    handleCancelOrder,
    handleCloseCancelModal,
    handleConfirmCancel,
  } = useCancelOrder();

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filteredOrders,
    itemsPerPage: 10,
  });

  const handleOrderSelect = useCallback(
    (order: OrderWithItemsT) => {
      openOrderModal(order);
    },
    [openOrderModal],
  );

  const handleCloseModal = useCallback(() => {
    closeOrderModal();
  }, [closeOrderModal]);

  const handleReorder = useCallback((order: OrderWithItemsT) => {
    // TODO: Implement reorder flow
    console.log("Reorder:", order.id);
  }, []);

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <OrdersErrorState error={error} onRetry={refetch} />;
  }

  // Empty state - no orders at all
  if (!orders || orders.length === 0) {
    return <OrdersEmptyState />;
  }

  return (
    <>
      <section className="orders-terminal relative z-10 px-8 lg:px-24 py-16 lg:py-24">
        <PageContainer>
          <OrdersTerminalHeader
            viewMode={viewMode}
            activeCount={filteredOrders.length}
            onViewModeChange={setViewMode}
          />

          {filteredOrders.length > 0 ? (
            <>
              <OrdersTerminalTable
                orders={paginatedItems}
                onViewOrder={handleOrderSelect}
                onReorder={handleReorder}
                onCancelOrder={handleCancelOrder}
                viewMode={viewMode}
              />

              <OrdersTerminalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
              />
            </>
          ) : (
            <Alert className="text-center">
              <AlertDescription>
                No orders match the selected filters.
              </AlertDescription>
            </Alert>
          )}

          <OrderDetailsModal
            order={state.selectedOrder}
            isOpen={state.isModalOpen}
            onClose={handleCloseModal}
          />

          <CancelOrderModal
            order={orderToCancel}
            isOpen={cancelModalOpen}
            onClose={handleCloseCancelModal}
            onConfirm={handleConfirmCancel}
            isLoading={isCancelling}
          />
        </PageContainer>
      </section>
    </>
  );
}
