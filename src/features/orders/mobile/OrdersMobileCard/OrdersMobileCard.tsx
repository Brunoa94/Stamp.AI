"use client";

import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { OrdersMobileCardActions } from "./OrdersMobileCardActions";
import { OrdersMobileCardHeader } from "./OrdersMobileCardHeader";
import { OrdersMobileCardSummary } from "./OrdersMobileCardSummary";

interface OrdersMobileCardProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrdersMobileCard({
  order,
  onViewOrder,
  onReorder,
}: OrdersMobileCardProps) {
  return (
    <div className={ordersTheme.mobileCard.container}>
      <OrdersMobileCardHeader order={order} />
      <OrdersMobileCardSummary order={order} />
      <OrdersMobileCardActions
        order={order}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
      />
    </div>
  );
}
