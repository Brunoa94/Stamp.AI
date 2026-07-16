import { useTranslations } from "next-intl";
import type { OrderWithItemsT } from "@/types/order";
import { OrdersListItem } from "./OrdersListItem/OrdersListItem";

interface PropsI {
  orders: OrderWithItemsT[];
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersListSection({
  orders,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const t = useTranslations("orders.listSection");

  return (
    <section className="space-y-4" aria-label={t("ariaLabel")}>
      {orders.map((order) => (
        <OrdersListItem
          key={order.id}
          order={order}
          onOpenDetails={onOpenDetails}
          onCancelOrder={onCancelOrder}
          onReorder={onReorder}
        />
      ))}
    </section>
  );
}
