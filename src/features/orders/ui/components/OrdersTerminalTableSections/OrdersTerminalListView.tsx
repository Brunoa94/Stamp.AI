import { OrderWithItemsT } from "@/types/order";
import { OrderActionsType } from "../../../types/orders-terminal";
import { OrdersTerminalListItem } from "./OrdersTerminalListItem";

interface PropsI extends OrderActionsType {
  orders: OrderWithItemsT[];
}

export function OrdersTerminalListView({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  return (
    <div className="hidden md:flex md:flex-col md:gap-6">
      {orders.map((order) => (
        <OrdersTerminalListItem
          key={order.id}
          order={order}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
        />
      ))}
    </div>
  );
}
