"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RecentOrdersCardHeader } from "./RecentOrders/RecentOrdersCardHeader";
import { RecentOrdersEmptyState } from "./RecentOrders/RecentOrdersEmptyState";
import { RecentOrderItem } from "./RecentOrders/RecentOrderItem";
import type { OrderWithItemsT } from "@/types/order";

const OrdersDetailsModal = dynamic(
  () =>
    import("@/features/orders/ui/components/OrdersDetailsModal/OrdersDetailsModal").then(
      (mod) => mod.OrdersDetailsModal,
    ),
  { ssr: false },
);

interface PropsI {
  orders: OrderWithItemsT[];
}

const RECENT_ORDERS_LIMIT = 5;

export function RecentOrdersCard({ orders }: PropsI) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentOrders = orders.slice(0, RECENT_ORDERS_LIMIT);

  const handleOrderClick = useCallback((order: OrderWithItemsT) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }, []);

  return (
    <>
      <section className="brutalist-card border-l-4 border-green">
        <div className="p-8 border-b border-ink/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <RecentOrdersCardHeader ordersCount={recentOrders.length} />
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-20">
            <RecentOrdersEmptyState />
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {recentOrders.map((order) => (
              <RecentOrderItem
                key={order.id}
                order={order}
                onClick={handleOrderClick}
              />
            ))}
          </div>
        )}
      </section>

      {isModalOpen && selectedOrder && (
        <OrdersDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </>
  );
}
