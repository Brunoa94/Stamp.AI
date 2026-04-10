import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { ChevronDown, Mail, Repeat, Sparkles } from "lucide-react";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { TableCell, TableRow } from "@/features/ui/table";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const supportEmailHref = useMemo(() => {
    const subject = encodeURIComponent(`Support request for order ${order.id}`);
    const body = encodeURIComponent(
      `Hi support,%0D%0A%0D%0AI need help with order ${order.id}.%0D%0AStatus: ${order.status ?? "processing"}.%0D%0A%0D%0AThanks.`,
    );

    return `mailto:?subject=${subject}&body=${body}`;
  }, [order.id, order.status]);

  const preferredReusableOrderItemId = useMemo(() => {
    return (
      order.order_items?.find((item) => Boolean(item.custom_image_url))?.id ??
      order.order_items?.[0]?.id ??
      ""
    );
  }, [order.order_items]);

  return (
    <>
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
          <OrderItemsPreview
            items={order.order_items || []}
            maxDisplay={1}
            imageClassName="h-[88px] w-[88px]"
          />
        </TableCell>

        <TableCell className={ordersTheme.table.cell}>
          <span className={getStatusBadgeClass(order.status)}>
            {order.status || "Processing"}
          </span>
        </TableCell>

        <TableCell className={`${ordersTheme.table.cell} text-right`}>
          <div className={ordersTheme.table.total}>
            {formatPrice(order.total_amount)}
          </div>
        </TableCell>

        <TableCell className={ordersTheme.table.cell}>
          <div className="flex flex-col items-end gap-2">
            <OrderTableActions
              order={order}
              onViewOrder={onViewOrder}
              onCancelOrder={onCancelOrder}
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded((previous) => !previous)}
              className={ordersTheme.table.moreActionsTrigger}
              aria-expanded={isExpanded}
            >
              More actions
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isExpanded ? "rotate-180" : "rotate-0",
                )}
              />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className={ordersTheme.table.moreActionsRow}>
          <TableCell colSpan={5} className={ordersTheme.table.moreActionsCell}>
            <div className={ordersTheme.table.moreActionsPanel}>
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className={ordersTheme.table.moreActionsButton}
              >
                <Link
                  href={
                    preferredReusableOrderItemId
                      ? `/stamp?sourceOrder=${order.id}&sourceOrderItem=${preferredReusableOrderItemId}`
                      : `/stamp?sourceOrder=${order.id}`
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Use same image
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReorder(order)}
                className={ordersTheme.table.moreActionsButton}
              >
                <Repeat className="h-3.5 w-3.5" />
                Reorder
              </Button>

              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className={ordersTheme.table.moreActionsButton}
              >
                <a href={supportEmailHref}>
                  <Mail className="h-3.5 w-3.5" />
                  Report about this order
                </a>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export const MemoizedOrderTableRow = memo(OrderTableRow);
