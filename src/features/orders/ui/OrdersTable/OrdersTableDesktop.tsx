"use client";

import { memo } from "react";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { Table, TableBody } from "@/features/ui/table";
import { OrderTableHeader } from "./OrderTableHeader";
import { MemoizedOrderTableRow } from "./OrderTableRow";
import { getStatusBadgeClass } from "@/features/orders/lib/utils/statusBadge";

interface OrdersTableDesktopProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

export function OrdersTableDesktop({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: OrdersTableDesktopProps) {
  return (
    <div className={`${ordersTheme.table.container} hidden md:block`}>
      <Table className={ordersTheme.table.table}>
        <OrderTableHeader />
        <TableBody className={ordersTheme.table.tbody}>
          {orders.map((order) => (
            <MemoizedOrderTableRow
              key={order.id}
              order={order}
              onViewOrder={onViewOrder}
              onReorder={onReorder}
              onCancelOrder={onCancelOrder}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const MemoizedOrdersTableDesktop = memo(OrdersTableDesktop);
