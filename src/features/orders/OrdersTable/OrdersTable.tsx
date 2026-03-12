import { OrderWithItemsT } from "@/types/order";
import { OrdersTableDesktop } from "./OrdersTableDesktop";
import { OrdersTableMobile } from "./OrdersTableMobile";

interface OrdersTableProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
}

export function OrdersTable({
  orders,
  onViewOrder,
  onReorder,
}: OrdersTableProps) {
  return (
    <>
      <OrdersTableMobile
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
      />

      <OrdersTableDesktop
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
      />
    </>
  );
}
