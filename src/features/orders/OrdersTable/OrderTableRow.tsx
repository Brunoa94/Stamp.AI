import { memo } from "react";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { TableCell, TableRow } from "@/features/ui/table";
import { OrderItemsPreview } from "../OrderItemsPreview";
import { OrderTableActions } from "./OrderTableActions";
import {
  formatOrderId,
  formatOrderDate,
  formatPrice,
} from "../utils/orderFormatters";

interface OrderTableRowProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
  onProceedToPayment?: (order: OrderWithItemsT) => void;
  getStatusBadgeClass: (status: string | null) => string;
}

export function OrderTableRow({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
  onProceedToPayment,
  getStatusBadgeClass,
}: OrderTableRowProps) {
  const statusLabel = order.refund_failed
    ? "refund_failed"
    : order.status || "processing";

  return (
    <TableRow className={ordersTheme.table.row}>
      <TableCell className={ordersTheme.table.cell}>
        <div className={ordersTheme.table.orderNumber}>
          {formatOrderId(order.id)}
        </div>
        <div className={ordersTheme.table.orderDate}>
          Ordered {formatOrderDate(order.created_at)}
        </div>
      </TableCell>

      <TableCell className={ordersTheme.table.cell}>
        <OrderItemsPreview items={order.order_items || []} maxDisplay={1} />
      </TableCell>

      <TableCell className={ordersTheme.table.cell}>
        <span className={getStatusBadgeClass(statusLabel)}>{statusLabel}</span>
      </TableCell>

      <TableCell className={`${ordersTheme.table.cell} text-right`}>
        <div className={ordersTheme.table.total}>
          {formatPrice(order.total_amount)}
        </div>
      </TableCell>

      <TableCell className={ordersTheme.table.cell}>
        <OrderTableActions
          order={order}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
          onProceedToPayment={onProceedToPayment}
        />
      </TableCell>
    </TableRow>
  );
}

export const MemoizedOrderTableRow = memo(OrderTableRow);
