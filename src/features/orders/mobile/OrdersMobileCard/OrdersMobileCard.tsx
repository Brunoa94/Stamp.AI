"use client";

import { memo } from "react";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { OrdersMobileCardActions } from "./OrdersMobileCardActions";
import { OrdersMobileCardHeader } from "./OrdersMobileCardHeader";
import { OrdersMobileCardSummary } from "./OrdersMobileCardSummary";

interface OrdersMobileCardProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
  onProceedToPayment?: (order: OrderWithItemsT) => void;
}

export function OrdersMobileCard({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
  onProceedToPayment,
}: OrdersMobileCardProps) {
  return (
    <div className={ordersTheme.mobileCard.container}>
      <OrdersMobileCardHeader order={order} />
      <OrdersMobileCardSummary order={order} />
      <OrdersMobileCardActions
        order={order}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
        onProceedToPayment={onProceedToPayment}
      />
    </div>
  );
}

export const MemoizedOrdersMobileCard = memo(OrdersMobileCard);
