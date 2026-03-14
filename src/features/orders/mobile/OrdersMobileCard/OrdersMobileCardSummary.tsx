import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { OrderItemsPreview } from "../OrderItemsPreview";
import { formatDeliveryInfo, formatPrice } from "../utils/orderFormatters";

interface OrdersMobileCardSummaryProps {
  order: OrderWithItemsT;
}

export function OrdersMobileCardSummary({
  order,
}: OrdersMobileCardSummaryProps) {
  const delivery = formatDeliveryInfo(order);
  const itemCount = order.order_items?.length || 0;

  return (
    <div className={ordersTheme.mobileCard.infoRow}>
      <OrderItemsPreview
        items={order.order_items || []}
        maxDisplay={1}
        className={ordersTheme.mobileCard.itemsStack}
      />

      <div className="text-right flex flex-col items-end">
        <div className={ordersTheme.mobileCard.priceText}>
          {formatPrice(order.total_amount)}
        </div>

        <div className="flex flex-col items-end">
          <span className={ordersTheme.mobileCard.itemCount}>
            {itemCount} Item{itemCount !== 1 ? "s" : ""}
          </span>

          {delivery && (
            <div className={ordersTheme.mobileCard.deliveryWrap}>
              <span className={delivery.dotClass} />
              <span className={ordersTheme.mobileCard.deliveryText}>
                {delivery.text}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
