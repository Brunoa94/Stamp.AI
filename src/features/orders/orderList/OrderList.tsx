import { OrderWithItemsT } from "@/types/order";
import { OrderCard } from "../orderCard/OrderCard";

interface Props {
  orders: OrderWithItemsT[];
  onOrderSelect: (order: OrderWithItemsT) => void;
}

export function OrderList({ orders, onOrderSelect }: Props) {
  return (
    <ul className="space-y-4 list-none">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} onViewDetails={onOrderSelect} />
        </li>
      ))}
    </ul>
  );
}
