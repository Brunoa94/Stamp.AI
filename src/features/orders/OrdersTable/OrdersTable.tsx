import { memo } from "react";
import { OrderWithItemsT } from "@/types/order";
import { MemoizedOrdersTableDesktop } from "./OrdersTableDesktop";
import { MemoizedOrdersTableMobile } from "../mobile/OrdersTableMobile";

interface OrdersTableProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrdersTable({
  orders,
  onViewOrder,
  onReorder,
}: OrdersTableProps) {
  return (
    <>
      <MemoizedOrdersTableMobile
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
      />

      <MemoizedOrdersTableDesktop
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
      />
    </>
  );
}

export const MemoizedOrdersTable = memo(OrdersTable);
