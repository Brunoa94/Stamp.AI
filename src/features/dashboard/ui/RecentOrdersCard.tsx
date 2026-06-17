"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { dashboardTheme } from "@/theme/components";
import { BrutalistCard } from "./BrutalistCard";
import { RecentOrdersCardHeader } from "./RecentOrders/RecentOrdersCardHeader";
import { RecentOrdersEmptyState } from "./RecentOrders/RecentOrdersEmptyState";
import { RecentOrderItem } from "./RecentOrders/RecentOrderItem";
import type { OrderWithItemsT } from "@/types/order";

const OrderDetailsModal = dynamic(
  () =>
    import("@/features/orders/ui/components/OrderDetails/OrderDetailsModal/OrderDetailsModal"),
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
      <BrutalistCard accentColor="green">
        <RecentOrdersCardHeader ordersCount={recentOrders.length} />

        {recentOrders.length === 0 ? (
          <RecentOrdersEmptyState />
        ) : (
          <div className={dashboardTheme.orders.list}>
            {recentOrders.map((order) => (
              <RecentOrderItem
                key={order.id}
                order={order}
                onClick={handleOrderClick}
              />
            ))}
          </div>
        )}
      </BrutalistCard>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
