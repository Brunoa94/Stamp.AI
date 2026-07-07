/**
 * Orders Terminal Grid Component
 *
 * Grid view card for displaying orders in a terminal-style layout.
 * Follows FSD pattern and design system guidelines.
 */

import { memo } from "react";
import { OrderWithItemsT } from "@/types/order";
import { formatOrderDate } from "@/features/orders/lib/utils/formatOrderDate";
import { formatOrderId } from "@/features/orders/lib/utils/formatOrderId";
import { formatPrice } from "@/features/orders/lib/utils/formatPrice";
import { canCancelOrder } from "@/features/orders/lib/utils/orderCancellation";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { OrderActionsType, OrderStatusType } from "../../types/orders-terminal";
import { getOrderStatusConfig } from "../../helpers/getOrderStatusConfig";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface PropsI extends OrderActionsType {
  order: OrderWithItemsT;
  index: number;
}

/**
 * Grid card component for orders terminal
 */
function OrdersTerminalGrid({
  order,
  index,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  const firstItem = order.order_items?.[0];
  const canCancel = canCancelOrder(order);
  const isCancelled = order.status === "cancelled";
  const status: OrderStatusType =
    order.status === "delivered" ||
    order.status === "shipped" ||
    order.status === "processing" ||
    order.status === "cancelled"
      ? order.status
      : undefined;
  const statusConfig = getOrderStatusConfig(status);

  return (
    <div
      onClick={() => onViewOrder(order)}
      className={cn(
        "group border p-10 flex flex-col justify-between min-h-95 cursor-pointer transition-all duration-300",
        "shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
        statusConfig.hoverBg,
        "border-ink/10 bg-white hover:text-ink",
      )}
    >
      {/* Top Section: Number + Status Badge */}
      <div className="flex justify-between items-start mb-8">
        <Span
          variant="metric"
          className="text-ink opacity-10 transition-opacity group-hover:opacity-100"
        >
          {String(index + 1).padStart(2, "0")}
        </Span>
        <OrderStatusBadge
          status={order.status}
          showIcon
          className="group-hover:border-white/40 group-hover:bg-white/20 group-hover:text-white"
        />
      </div>

      {/* Middle Section: Order ID + Date */}
      <div className="space-y-2 mb-12">
        <Heading
          as="h3"
          variant="card"
          className="transition-colors group-hover:text-white"
        >
          {formatOrderId(order.id)}
        </Heading>
        <Span
          as="p"
          variant="default"
          className="text-ink/30 transition-colors group-hover:text-white/80"
        >
          Processed {formatOrderDate(order.created_at)} / Terminal NYC
        </Span>
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <Paragraph
          as="p"
          className="font-bold mb-1 transition-colors group-hover:text-white"
        >
          {firstItem?.product_name || "Custom Product"} -{" "}
          {firstItem?.variant_name || "Standard"}
        </Paragraph>
        <Paragraph
          as="p"
          className="text-ink/60 transition-colors group-hover:text-white/80"
        >
          {firstItem?.variant_name || "Standard Variant"} / Qty{" "}
          {firstItem?.quantity || 1}
        </Paragraph>
      </div>

      {/* Bottom Section: Price + Actions */}
      <div className="flex items-end justify-between mt-12">
        <Heading
          as="span"
          variant="card"
          className="transition-colors group-hover:text-white"
        >
          {formatPrice(order.total_amount)}
        </Heading>
        <div className="flex gap-4">
          {canCancel && !isCancelled ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCancelOrder?.(order);
              }}
              variant="card-outline-danger"
            >
              CANCEL
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onReorder(order);
              }}
              variant="card-outline"
            >
              REORDER
            </Button>
          )}
          <Button variant="card-solid">TRACK</Button>
        </div>
      </div>
    </div>
  );
}

export const MemoizedOrdersTerminalGrid = memo(OrdersTerminalGrid);
