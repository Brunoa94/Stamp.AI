"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrder";
import { usePagination } from "@/hooks/usePagination";
import { OrderWithItemsT } from "@/types/order";
import { OrdersHeader } from "../sections/OrdersHeader";
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

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <>
        <OrdersHeader />
        <OrdersEmptyState />
      </>
    );
  }

  return (
    <>
      <OrdersHeader />

      {/* Filters */}
      <div className="mb-6">
        <OrderFilters
          filters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Orders List */}
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
        <div className="flex items-center justify-center min-h-75">
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-700">
              No orders match your filters
            </p>
            <p className="text-gray-600">
              Try adjusting or clearing your filters
            </p>
          </div>
        </div>
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
