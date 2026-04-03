import { OrderWithItemsT } from "@/types/order";
import { OrdersTableDesktop } from "./OrdersTableDesktop";
import { OrdersTableMobile } from "../mobile/OrdersTableMobile";

interface OrdersTableProps {
  orders: OrderWithItemsT[];
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
}

export function OrdersTable({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
}: OrdersTableProps) {
  return (
    <>
      <OrdersTableMobile
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
      />

      <OrdersTableDesktop
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
      />
    </>
  );
}
