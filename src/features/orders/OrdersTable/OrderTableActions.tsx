import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { OrderWithItemsT } from "@/types/order";

interface OrderTableActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

// Orders can only be cancelled if they haven't started processing yet
const CANCELLABLE_STATUSES = ["created", "pending", null];

export function OrderTableActions({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: OrderTableActionsProps) {
  const isCancelled = order.status === "cancelled";
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

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
      <Button
        onClick={() => onReorder(order)}
        variant="outline"
        size="default"
        className={ordersTheme.table.reorderButton}
      >
        REORDER
      </Button>
      {isCancelled ? (
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
