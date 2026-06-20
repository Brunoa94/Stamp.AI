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
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { OrderActionsType, OrderStatusType } from "../../types/orders-terminal";
import { getOrderStatusConfig } from "../../helpers/getOrderStatusConfig";

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
  const StatusIcon = statusConfig.icon;

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
          as="span"
          unstyled
          className={cn(
            "font-anton text-4xl transition-opacity",
            "text-ink opacity-10 group-hover:opacity-100",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </Span>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border",
            `text-${statusConfig.color} bg-${statusConfig.bgColor} border-${statusConfig.borderColor}`,
            "group-hover:bg-white/20 group-hover:text-white group-hover:border-white/40",
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* Middle Section: Order ID + Date */}
      <div className="space-y-2 mb-12">
        <h3 className="font-anton text-4xl uppercase tracking-tighter group-hover:text-white transition-colors">
          {formatOrderId(order.id)}
        </h3>
        <Paragraph
          variant="sm"
          as="p"
          className={cn(
            "text-[10px] font-bold tracking-[0.3em] uppercase transition-colors",
            "text-ink/30 group-hover:text-white/80",
          )}
        >
          Processed {formatOrderDate(order.created_at)} / Terminal NYC
        </Paragraph>
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <Paragraph
          as="p"
          variant="body"
          className="font-bold text-lg mb-1 group-hover:text-white transition-colors"
        >
          {firstItem?.product_name || "Custom Product"} -{" "}
          {firstItem?.variant_name || "Standard"}
        </Paragraph>
        <Paragraph
          as="p"
          variant="sm"
          className={cn(
            "text-xs uppercase transition-colors",
            "text-ink/60 group-hover:text-white/80",
          )}
        >
          {firstItem?.variant_name || "Standard Variant"} / Qty{" "}
          {firstItem?.quantity || 1}
        </Paragraph>
      </div>

      {/* Bottom Section: Price + Actions */}
      <div className="flex items-end justify-between mt-12">
        <Span
          as="span"
          unstyled
          className="font-anton text-3xl group-hover:text-white transition-colors"
        >
          {formatPrice(order.total_amount)}
        </Span>
        <div className="flex gap-4">
          {canCancel && !isCancelled ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCancelOrder?.(order);
              }}
              variant="outline"
              className={cn(
                "border px-6 py-2 font-anton text-xs tracking-widest uppercase transition-all",
                "border-ink/20 group-hover:border-white/40 text-red-600 group-hover:text-red-600",
                "hover:bg-transparent hover:text-red-600",
              )}
            >
              CANCEL
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onReorder(order);
              }}
              variant="outline"
              className={cn(
                "border px-6 py-2 font-anton text-xs tracking-widest uppercase transition-all",
                "border-ink/20 text-ink group-hover:border-white/40 group-hover:text-ink",
                "hover:bg-transparent hover:text-ink",
              )}
            >
              REORDER
            </Button>
          )}
          <Button
            variant="default"
            className={cn(
              "px-6 py-2 font-anton text-xs tracking-widest uppercase transition-all",
              "bg-ink text-white group-hover:bg-white",
              order.status === "delivered" || order.status === "shipped"
                ? "group-hover:text-cyan"
                : order.status === "processing"
                  ? "group-hover:text-orange"
                  : "group-hover:text-purple",
            )}
          >
            TRACK
          </Button>
        </div>
      </div>
    </div>
  );
}

export const MemoizedOrdersTerminalGrid = memo(OrdersTerminalGrid);
