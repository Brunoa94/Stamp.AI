"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrder";
import { OrderWithItemsT } from "@/types/order";
import { OrdersHeader } from "../sections/OrdersHeader";
import { OrdersLoadingSkeleton, OrdersErrorState, OrdersEmptyState, OrderList } from "../components/orderList";
import { OrderFilters } from "../components/orderFilters/OrderFilters";
import { OrderDetailsModal } from "../components/orderDetails";
import { useOrderFilters } from "../hooks/useOrderFilters";

export function OrdersContent() {
  const { data: user } = useUser();
  const { data: orders, isLoading, error, refetch } = useOrders(user?.id);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    filteredOrders,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  } = useOrderFilters(orders);

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

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} order
          {orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <OrderList orders={filteredOrders} onOrderSelect={handleOrderSelect} />
      ) : (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-700">
              No orders match your filters
            </p>
            <p className="text-gray-600">Try adjusting or clearing your filters</p>
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
