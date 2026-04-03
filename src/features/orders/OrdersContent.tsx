"use client";

import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { usePagination } from "@/hooks/usePagination";
import { OrderWithItemsT } from "@/types/order";
import {
  OrdersLoadingSkeleton,
  OrdersErrorState,
  OrdersEmptyState,
} from "./OrdersStates";
import { OrdersFiltersBar } from "./OrdersFiltersBar";
import { PageHeader } from "@/features/ui/page-header";
import { useOrderFilters } from "./hooks/useOrderFilters";
import { useCancelOrder } from "./hooks/useCancelOrder";
import { Alert, AlertDescription } from "@/features/ui/alert";
import dynamic from "next/dynamic";
import { OrdersTable } from "./OrdersTable/OrdersTable";
import { OrdersPagination } from "./OrdersTable/OrdersPagination";
import { CancelOrderModal } from "./CancelOrderModal";

const OrderDetailsModal = dynamic(
  () => import("./OrderDetails/OrderDetailsModal/OrderDetailsModal"),
  {
    ssr: false,
  },
);

export default function OrdersContent() {
  const { data: user } = useUser();
  const { data: orders, isLoading, error, refetch } = useOrders(user?.id);
  const {
    state,
    filteredOrders,
    openOrderModal,
    closeOrderModal,
    setStatusFilter,
    setTimeframeFilter,
  } = useOrderFilters(orders);

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

  const handleOrderSelect = (order: OrderWithItemsT) => {
    openOrderModal(order);
  };

  const handleCloseModal = () => {
    closeOrderModal();
  };

  const handleReorder = (order: OrderWithItemsT) => {
    // TODO: Implement reorder flow
    console.log("Reorder:", order.id);
  };

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
      <PageHeader
        title="My Orders"
        description="View and manage your order history. Track deliveries, review past purchases, and download invoices."
      />

      <OrdersFiltersBar
        selectedStatus={state.selectedStatus}
        onStatusChange={setStatusFilter}
        selectedTimeframe={state.selectedTimeframe}
        onTimeframeChange={setTimeframeFilter}
      />

      {filteredOrders.length > 0 ? (
        <>
          <OrdersTable
            orders={paginatedItems}
            onViewOrder={handleOrderSelect}
            onReorder={handleReorder}
            onCancelOrder={handleCancelOrder}
          />

          <OrdersPagination
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
    </>
  );
}
