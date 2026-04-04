import { Button } from "@/features/ui/button";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";

interface OrdersMobileCardActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

// Orders can only be cancelled if they haven't started processing yet
const CANCELLABLE_STATUSES = ["created", "pending", null];

export function OrdersMobileCardActions({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: OrdersMobileCardActionsProps) {
  const isCancelled = order.status === "cancelled";
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className={ordersTheme.mobileCard.actions}>
      <Button
        onClick={() => onViewOrder(order)}
        variant="default"
        size="default"
        className={ordersTheme.mobileCard.viewButton}
      >
        View
      </Button>
      <Button
        onClick={() => onReorder(order)}
        variant="outline"
        size="default"
        className={ordersTheme.mobileCard.reorderButton}
      >
        Reorder
      </Button>
      {isCancelled ? (
        <span className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-muted-foreground max-w-23.25">
          Canceled
        </span>
      ) : (
        <Button
          onClick={() => canCancel && onCancelOrder?.(order)}
          variant="destructive"
          size="default"
          disabled={!canCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
