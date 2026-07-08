import { canCancelOrder } from "../../../lib/utils/orderCancellation";
import type { OrderWithItemsT } from "@/types/order";
import { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { toDisplayStatus } from "../../../lib/helpers/statusPresentation";
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
  const displayedStatus = toDisplayStatus(order.status);
  const canCancel = canCancelOrder(order);

  return (
    <article className="group border border-(--color-stamp-divider) bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-[0_20px_40px_rgba(61,40,23,0.05)]">
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
