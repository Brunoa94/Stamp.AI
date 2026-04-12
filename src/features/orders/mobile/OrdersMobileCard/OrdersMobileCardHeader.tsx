import { ordersTheme } from "@/theme/components";
import type { OrderWithItemsT } from "@/types/order";
import { formatOrderDate, formatOrderId } from "../../utils/orderFormatters";
import { getStatusBadgeClass } from "../../utils/statusBadge";

interface OrdersMobileCardHeaderProps {
  order: OrderWithItemsT;
}

export function OrdersMobileCardHeader({ order }: OrdersMobileCardHeaderProps) {
  return (
    <div className={ordersTheme.mobileCard.header}>
      <div>
        <div className={ordersTheme.mobileCard.orderNumber}>
          {formatOrderId(order.id)}
        </div>
        <div className={ordersTheme.mobileCard.orderDate}>
          Ordered {formatOrderDate(order.created_at)}
        </div>
      </div>
      <span className={getStatusBadgeClass(order.status)}>
        {order.status || "Processing"}
      </span>
    </div>
  );
}
