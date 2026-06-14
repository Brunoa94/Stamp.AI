import { OrderWithItemsT } from "@/types/order";
import { MemoizedOrdersTerminalGrid } from "../OrdersTerminalGrid";
import { OrderActionsType } from "../../../types/orders-terminal";

interface PropsI extends OrderActionsType {
  orders: OrderWithItemsT[];
}

export function OrdersTerminalGridView({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: PropsI) {
  return (
    <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6">
      {orders.map((order, index) => (
        <MemoizedOrdersTerminalGrid
          key={order.id}
          order={order}
          index={index}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
        />
      ))}
    </div>
  );
}
