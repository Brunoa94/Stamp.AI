import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { OrderWithItemsT } from "@/types/order";
import { canCancelOrder, canProceedToPayment } from "../utils/lifecycleRules";

interface OrderTableActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
  onProceedToPayment?: (order: OrderWithItemsT) => void;
}

export function OrderTableActions({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
  onProceedToPayment,
}: OrderTableActionsProps) {
  const isCancelled = order.status === "cancelled";
  const canCancel = canCancelOrder(order);
  const canProceed = canProceedToPayment(order);

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
      {canProceed ? (
        <Button
          onClick={() => onProceedToPayment?.(order)}
          variant="outline"
          size="default"
        >
          PAY NOW
        </Button>
      ) : null}
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
