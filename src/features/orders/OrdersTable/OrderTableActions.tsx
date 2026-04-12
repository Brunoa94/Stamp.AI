import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { OrderWithItemsT } from "@/types/order";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { canCancelOrder } from "../utils/orderCancellation";

interface OrderTableActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

// Payment statuses that allow the user to retry payment
const RETRYABLE_PAYMENT_STATUSES = ["failed", "pending"];

export function OrderTableActions({
  order,
  onViewOrder,
  onCancelOrder,
}: OrderTableActionsProps) {
  const isCancelled = order.status === "cancelled";
  const canCancel = canCancelOrder(order);
  const canRetryPayment =
    !isCancelled &&
    RETRYABLE_PAYMENT_STATUSES.includes(order.payment_status ?? "");

  return (
    <div className={ordersTheme.table.actions}>
      <Button
        onClick={() => onViewOrder(order)}
        variant="default"
        size="default"
        className={ordersTheme.table.viewButton}
      >
        VIEW
      </Button>
      {canRetryPayment ? (
        <Button asChild variant="outline" size="default">
          <Link href={`/checkout?retry_order_id=${order.id}`}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            RETRY PAYMENT
          </Link>
        </Button>
      ) : isCancelled ? (
        <span className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-muted-foreground max-w-23.25">
          CANCELED
        </span>
      ) : (
        <Button
          onClick={() => canCancel && onCancelOrder?.(order)}
          variant="destructive"
          size="default"
          disabled={!canCancel}
        >
          CANCEL
        </Button>
      )}
    </div>
  );
}
