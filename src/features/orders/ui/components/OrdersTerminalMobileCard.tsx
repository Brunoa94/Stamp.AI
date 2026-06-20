/**
 * Orders Terminal Mobile Card Component
 *
 * Mobile card display for orders with header, summary, and actions.
 * Follows FSD pattern and design system guidelines.
 */

import { memo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Mail, Repeat, Sparkles, RefreshCw } from "lucide-react";
import { OrderWithItemsT } from "@/types/order";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

import { useOrderMoreActions } from "../../lib/hooks/useOrderMoreActions";

import { cn } from "@/lib/utils";
import { canCancelOrder } from "@/features/orders/lib/utils/orderCancellation";
import { formatDeliveryInfo } from "@/features/orders/lib/utils/formatDeliveryInfo";
import { formatOrderId } from "@/features/orders/lib/utils/formatOrderId";
import { formatOrderDate } from "@/features/orders/lib/utils/formatOrderDate";
import { OrderItemsPreview } from "./OrderItemsPreview";
import { formatPrice } from "@/features/orders/lib/utils/formatPrice";

interface PropsI {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

/**
 * Mobile card component for orders terminal
 */
function OrdersTerminalMobileCard({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isCancelled = order.status === "cancelled";
  const canCancel = canCancelOrder(order);
  const { supportEmailHref, reuseImageUrl } = useOrderMoreActions(order);
  const canRetryPayment =
    !isCancelled && ["failed", "pending"].includes(order.payment_status ?? "");
  const delivery = formatDeliveryInfo(order);
  const itemCount = order.order_items?.length || 0;

  return (
    <div
      className={cn(
        "border p-6 transition-colors duration-300",
        "border-ink/10 bg-white",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-anton text-2xl uppercase tracking-tight mb-1">
            {formatOrderId(order.id)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30">
            Ordered {formatOrderDate(order.created_at)}
          </div>
        </div>
        <Span
          as="span"
          unstyled
          className={cn(
            "flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border",
            order.status === "delivered" || order.status === "shipped"
              ? "bg-cyan/5 border-cyan/20 text-cyan"
              : order.status === "processing"
                ? "bg-purple/5 border-purple/20 text-purple"
                : order.status === "cancelled"
                  ? "bg-ink/5 border-ink/10 text-ink/40"
                  : "bg-orange/5 border-orange/20 text-orange",
          )}
        >
          {order.status || "Processing"}
        </Span>
      </div>

      {/* Summary */}
      <div className="flex items-start justify-between border-y py-6 mb-6 border-ink/10">
        <OrderItemsPreview
          items={order.order_items || []}
          maxDisplay={1}
          className="flex -space-x-2"
        />

        <div className="text-right flex flex-col items-end">
          <div className="text-lg font-anton text-ink mb-1">
            {formatPrice(order.total_amount)}
          </div>

          <div className="flex flex-col items-end">
            <Span
              as="span"
              variant="default"
              className="tracking-widest text-ink/55"
            >
              {itemCount} Item{itemCount !== 1 ? "s" : ""}
            </Span>

            {delivery && (
              <div className="flex items-center gap-1.5 mt-1">
                <Span as="span" unstyled className={delivery.dotClass} />
                <Span
                  as="span"
                  variant="default"
                  className="tracking-widest text-ink/60"
                >
                  {delivery.text}
                </Span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-2">
        <Button
          onClick={() => onViewOrder(order)}
          variant="default"
          size="default"
          className="flex-1"
        >
          View
        </Button>
        <Button
          onClick={() => onReorder(order)}
          variant="outline"
          size="default"
          className="flex-1"
        >
          Reorder
        </Button>
        {canRetryPayment ? (
          <Button asChild variant="outline" size="default" className="flex-1">
            <Link href={`/checkout?retry_order_id=${order.id}`}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry Payment
            </Link>
          </Button>
        ) : isCancelled ? (
          <Span
            as="span"
            unstyled
            className={cn(
              "inline-flex items-center justify-center h-10 px-4 text-sm font-medium flex-1",
              "text-muted-foreground",
            )}
          >
            Canceled
          </Span>
        ) : (
          <Button
            onClick={() => canCancel && onCancelOrder?.(order)}
            variant="destructive"
            size="default"
            disabled={!canCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* More Actions Dropdown */}
      <div className="flex justify-center mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((previous: boolean) => !previous)}
          aria-expanded={isExpanded}
          className={cn(
            "transition-colors",
            isExpanded
              ? "bg-[#7C3AED]/12 text-[#7C3AED] hover:bg-[#7C3AED]/20"
              : "text-ink/60 hover:bg-ink/10 hover:text-ink",
          )}
        >
          More actions
          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>
      </div>

      {isExpanded && (
        <div
          className={cn(
            "mt-3 flex flex-col gap-2 border-t pt-3",
            "border-border",
          )}
        >
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Link href={reuseImageUrl}>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Use same image
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReorder(order)}
            className="w-full justify-start"
          >
            <Repeat className="mr-2 h-3.5 w-3.5" />
            Reorder
          </Button>

          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <a href={supportEmailHref}>
              <Mail className="mr-2 h-3.5 w-3.5" />
              Report about this order
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

export const MemoizedOrdersTerminalMobileCard = memo(OrdersTerminalMobileCard);
