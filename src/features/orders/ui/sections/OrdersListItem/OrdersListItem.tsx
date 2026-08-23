import { canCancelOrder } from "../../../lib/utils/orderCancellation";
import type { OrderWithItemsT } from "@/types/order";
import { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { getOrderDisplayStatus } from "../../../lib/helpers/statusPresentation";
import { OrdersListItemImage } from "./OrdersListItemImage";
import { OrdersListItemContent } from "./OrdersListItemContent";
import { OrdersListItemActions } from "./OrdersListItemActions";

interface PropsI {
  order: OrderWithItemsT;
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersListItem({
  order,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const firstItem = getFirstOrderItem(order);
  const displayedStatus = getOrderDisplayStatus(order);
  const canCancel = canCancelOrder(order);

  return (
    <article className="group border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 font-heading transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover)">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        <OrdersListItemImage
          order={order}
          firstItem={firstItem}
          onOpenDetails={onOpenDetails}
        />
        <OrdersListItemContent
          order={order}
          firstItem={firstItem}
          displayedStatus={displayedStatus}
        />
        <OrdersListItemActions
          order={order}
          displayedStatus={displayedStatus}
          canCancel={canCancel}
          onOpenDetails={onOpenDetails}
          onCancelOrder={onCancelOrder}
          onReorder={onReorder}
        />
      </div>
    </article>
  );
}
