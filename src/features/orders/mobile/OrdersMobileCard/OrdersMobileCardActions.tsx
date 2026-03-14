import { Button } from "@/features/ui/button";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";

interface OrdersMobileCardActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrdersMobileCardActions({
  order,
  onViewOrder,
  onReorder,
}: OrdersMobileCardActionsProps) {
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
    </div>
  );
}
