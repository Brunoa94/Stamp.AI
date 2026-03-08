"use client";

import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { Table, TableBody } from "@/features/ui/table";
import { OrderTableHeader } from "./OrderTableHeader";
import { OrderTableRow } from "./OrderTableRow";
import { getStatusBadgeClass } from "../utils/statusBadge";

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
    <div className={ordersTheme.table.container}>
      <Table className={ordersTheme.table.table}>
        <OrderTableHeader />
        <TableBody className={ordersTheme.table.tbody}>
          {orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              onViewOrder={onViewOrder}
              onReorder={onReorder}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
