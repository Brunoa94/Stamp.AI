"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { usePagination } from "@/hooks/usePagination";
import { OrderWithItemsT } from "@/types/order";
import {
  OrdersLoadingSkeleton,
  OrdersErrorState,
  OrdersEmptyState,
  OrderList,
} from "../orderList";
import { OrderFilters } from "../orderFilters/OrderFilters";
import { useOrderFilters } from "../hooks/useOrderFilters";
import { OrderDetailsModal } from "../orderDetails/OrderDetailsModal";
import { Paginator } from "@/features/ui/paginator";
import { PageHeader } from "@/features/ui/page-header";

export function OrdersContent() {
  const { data: user } = useUser();
  const { data: orders, isLoading, error, refetch } = useOrders(user?.id);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { filteredOrders, filters, setFilter, clearFilters, hasActiveFilters } =
    useOrderFilters(orders);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filteredOrders,
    itemsPerPage: 5,
  });

  const handleOrderSelect = (order: OrderWithItemsT) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Loading state
  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <OrdersErrorState error={error} onRetry={refetch} />;
  }

  return (
    <>
      <PageHeader
        title="My Orders"
        description="View and manage your order history. Track deliveries, review past purchases, and download invoices."
      />

      {/* Empty state - no orders at all */}
      {!orders || orders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6">
            <OrderFilters
              filters={filters}
              onFilterChange={setFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Orders List or No Match Empty State */}
          {filteredOrders.length > 0 ? (
            <>
              <OrderList
                orders={paginatedItems}
                onOrderSelect={handleOrderSelect}
              />

              {/* Pagination */}
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
              />
            </>
          ) : (
            <OrdersEmptyState variant="no-match" onClearFilters={clearFilters} />
          )}
        </>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
