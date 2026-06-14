/**
 * Orders Terminal Mobile Component
 *
 * Mobile wrapper component that displays orders as cards.
 * Follows FSD pattern and design system guidelines.
 */

import { memo } from "react";
import { OrderWithItemsT } from "@/types/order";
import { MemoizedOrdersTerminalMobileCard } from "./OrdersTerminalMobileCard";
import { OrderActionsType } from "../../types/orders-terminal";

interface PropsI extends OrderActionsType {
  orders: OrderWithItemsT[];
}

/**
 * Mobile view component for orders terminal
 */
function OrdersTerminalMobileComponent({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  return (
    <div className="space-y-4 md:hidden">
      {orders.map((order) => (
        <MemoizedOrdersTerminalMobileCard
          key={order.id}
          order={order}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
        />
      ))}
    </div>
  );
}

export const OrdersTerminalMobile = memo(OrdersTerminalMobileComponent);
