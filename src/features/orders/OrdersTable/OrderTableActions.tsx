import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { OrderWithItemsT } from "@/types/order";

interface OrderTableActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrderTableActions({
  order,
  onViewOrder,
  onReorder,
}: OrderTableActionsProps) {
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
    </div>
  );
}
