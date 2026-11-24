import type { OrderWithItemsT } from "@/shared/types/order";
import { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { getOrderDisplayStatus } from "../../../lib/helpers/statusPresentation";
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
  const displayedStatus = getOrderDisplayStatus(order);

  return (
    <article className="group relative flex flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover)">
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
