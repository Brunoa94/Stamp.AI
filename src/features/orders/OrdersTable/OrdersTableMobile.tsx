"use client";

import { OrderWithItemsT } from "@/types/order";
import { OrdersMobileCard } from "../OrdersMobileCard/OrdersMobileCard";

interface OrdersTableMobileProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrdersTableMobile({
  orders,
  onViewOrder,
  onReorder,
}: OrdersTableMobileProps) {
  return (
    <div className="space-y-4 md:hidden">
      {orders.map((order) => (
        <OrdersMobileCard
          key={order.id}
          order={order}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
