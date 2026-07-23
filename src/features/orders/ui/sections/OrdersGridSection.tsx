import { useTranslations } from "next-intl";
import type { OrderWithItemsT } from "@/types/order";
import { OrdersGridItem } from "./OrdersGridItem/OrdersGridItem";

interface PropsI {
  orders: OrderWithItemsT[];
  startIndex: number;
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersGridSection({
  orders,
  startIndex,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const t = useTranslations("orders.gridSection");

  return (
    <section aria-label={t("ariaLabel")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {orders.map((order, idx) => (
          <OrdersGridItem
            key={order.id}
            order={order}
            index={startIndex + idx + 1}
            onOpenDetails={onOpenDetails}
            onCancelOrder={onCancelOrder}
            onReorder={onReorder}
          />
        ))}
      </div>
    </section>
  );
}
