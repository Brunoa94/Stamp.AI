import { OrderWithItemsT } from "@/types/order";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { formatOrderDate } from "@/features/orders/lib/utils/formatOrderDate";
import { formatOrderId } from "@/features/orders/lib/utils/formatOrderId";
import { formatPrice } from "@/features/orders/lib/utils/formatPrice";
import { canCancelOrder } from "@/features/orders/lib/utils/orderCancellation";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { OrderActionsType } from "../../../types/orders-terminal";
import { OrderStatusBadge } from "../OrderStatusBadge";

interface PropsI extends OrderActionsType {
  order: OrderWithItemsT;
}

export function OrdersTerminalListItem({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  const firstItem = order.order_items?.[0];
  const canCancel = canCancelOrder(order);
  const isCancelled = order.status === "cancelled";
  const canRetryPayment =
    !isCancelled && ["failed", "pending"].includes(order.payment_status ?? "");

  return (
    <article
      className={cn(
        "group border p-6 lg:p-10 transition-all duration-300",
        "border-ink/10 bg-white hover:shadow-xl hover:border-purple/35",
      )}
    >
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 items-start">
        <Button
          onClick={() => onViewOrder(order)}
          variant="ghost"
          className={cn(
            "relative w-full aspect-square overflow-hidden border flex items-center justify-center h-full",
            "border-ink/5 bg-concrete",
          )}
        >
          {firstItem?.custom_image_url ? (
            <Image
              src={firstItem.custom_image_url}
              alt={firstItem.product_name || "Order item"}
              fill
              sizes="200px"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className={cn("h-14 w-14", "text-ink/20")} />
            </div>
          )}
        </Button>

        <div className="flex-1 w-full space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div className="space-y-1">
              <Heading as="h3" variant="card">
                {firstItem?.product_name || "Custom Product"}
              </Heading>
              <Span as="p" variant="default" className="text-ink/30">
                ID: {formatOrderId(order.id)}
              </Span>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-8 border-y py-6 md:grid-cols-4",
              "border-ink/5",
            )}
          >
            <div className="space-y-1">
              <Span as="p" variant="micro" className="text-ink/30">
                Ordered
              </Span>
              <Paragraph as="p" className="font-bold">
                {formatOrderDate(order.created_at)}
              </Paragraph>
            </div>
            <div className="space-y-1">
              <Span as="p" variant="micro" className="text-ink/30">
                Variant
              </Span>
              <Paragraph as="p" className="font-bold">
                {firstItem?.variant_name || "Standard"}
              </Paragraph>
            </div>
            <div className="space-y-1">
              <Span as="p" variant="micro" className="text-ink/30">
                Qty
              </Span>
              <Paragraph as="p" className="font-bold">
                {firstItem?.quantity || 1}
              </Paragraph>
            </div>
            <div className="space-y-1">
              <Span as="p" variant="micro" className="text-ink/30">
                Value
              </Span>
              <Paragraph as="p" className="font-bold text-purple">
                {formatPrice(order.total_amount)} USD
              </Paragraph>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              type="button"
              onClick={() => onViewOrder(order)}
              variant="default"
            >
              Track Protocol
            </Button>

            {canRetryPayment ? (
              <Button asChild variant="outline">
                <Link href={`/checkout?retry_order_id=${order.id}`}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Retry Payment
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => onReorder(order)}
                variant="outline"
              >
                View Blueprint
              </Button>
            )}

            {!isCancelled && canCancel && (
              <Button
                type="button"
                onClick={() => onCancelOrder?.(order)}
                variant="destructive"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
