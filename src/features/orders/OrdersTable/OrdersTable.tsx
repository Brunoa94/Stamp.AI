import { memo } from "react";
import { OrderWithItemsT } from "@/types/order";
import { MemoizedOrdersTableDesktop } from "./OrdersTableDesktop";
import { MemoizedOrdersTableMobile } from "../mobile/OrdersTableMobile";

interface OrdersTableProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
  onProceedToPayment?: (order: OrderWithItemsT) => void;
}

export function OrdersTable({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
  onProceedToPayment,
}: OrdersTableProps) {
  return (
    <>
      <MemoizedOrdersTableMobile
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
        onProceedToPayment={onProceedToPayment}
      />

      <MemoizedOrdersTableDesktop
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
        onProceedToPayment={onProceedToPayment}
      />
    </>
  );
}

export const MemoizedOrdersTable = memo(OrdersTable);
