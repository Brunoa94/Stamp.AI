"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import type { OrderWithItemsT } from "@/types/order";
import { MemoizedOrderCard } from "@/features/orders/ui/OrderCard/OrderCard";

const OrderDetailsModal = dynamic(
  () => import("@/features/orders/ui/orderDetails/OrderDetailsModal/OrderDetailsModal"),
  { ssr: false }
);

interface RecentOrdersCardProps {
  orders: OrderWithItemsT[];
}

const RECENT_ORDERS_LIMIT = 5;

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentOrders = orders.slice(0, RECENT_ORDERS_LIMIT);
  const hasMore = orders.length > RECENT_ORDERS_LIMIT;

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
      <section className={dashboardTheme.orders.card}>
        <div className={dashboardTheme.orders.header}>
          <h4 className={dashboardTheme.card.sectionTitle}>Recent Orders</h4>
        </div>

        {recentOrders.length === 0 ? (
          <p className={dashboardTheme.orders.emptyState}>
            No recent orders yet. Start a new design to place your first order.
          </p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <MemoizedOrderCard
                key={order.id}
                order={order}
                onClick={handleOrderClick}
              />
            ))}

            {hasMore && (
              <Link
                href="/orders"
                className="flex items-center justify-center gap-1.5 w-full pt-2 text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
              >
                View all {orders.length} order{orders.length !== 1 ? "s" : ""}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </section>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
