import type { OrderWithItemsT } from "@/types/order";
import { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { toDisplayStatus } from "../../../lib/helpers/statusPresentation";
import { OrdersGridItemIndex } from "./OrdersGridItemIndex";
import { OrdersGridItemStatusBadge } from "./OrdersGridItemStatusBadge";
import { OrdersGridItemImage } from "./OrdersGridItemImage";
import { OrdersGridItemContent } from "./OrdersGridItemContent";

interface PropsI {
  order: OrderWithItemsT;
  index: number;
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersGridItem({
  order,
  index,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const firstItem = getFirstOrderItem(order);
  const displayedStatus = toDisplayStatus(order.status);

  return (
    <article className="group relative overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover)">
      <OrdersGridItemIndex index={index} />
      <OrdersGridItemStatusBadge displayedStatus={displayedStatus} />
      <OrdersGridItemImage
        order={order}
        firstItem={firstItem}
        onOpenDetails={onOpenDetails}
      />
      <OrdersGridItemContent
        order={order}
        firstItem={firstItem}
        onOpenDetails={onOpenDetails}
        onCancelOrder={onCancelOrder}
        onReorder={onReorder}
      />
    </article>
  );
}
