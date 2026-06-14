/**
 * Orders Terminal Table Component
 *
 * Main table component that switches between list and grid views.
 * Also includes mobile view handling.
 * Follows FSD pattern and design system guidelines.
 */

import { OrderWithItemsT } from "@/types/order";
import { OrdersTerminalMobile } from "./OrdersTerminalMobile";
import { OrdersTerminalListView } from "./OrdersTerminalTableSections/OrdersTerminalListView";
import { OrdersTerminalGridView } from "./OrdersTerminalTableSections/OrdersTerminalGridView";
import {
  OrderActionsType,
  OrdersViewModeType,
} from "../../types/orders-terminal";

interface PropsI extends OrderActionsType {
  orders: OrderWithItemsT[];
  viewMode?: OrdersViewModeType;
}

/**
 * Main table component for orders terminal
 * Handles both list and grid views, plus mobile responsiveness
 */
export function OrdersTerminalTable({
  orders,
  onViewOrder,
  onReorder,
  onCancelOrder,
  viewMode = "list",
}: PropsI) {
  return (
    <>
      <OrdersTerminalMobile
        orders={orders}
        onViewOrder={onViewOrder}
        onReorder={onReorder}
        onCancelOrder={onCancelOrder}
      />

      {viewMode === "list" ? (
        <OrdersTerminalListView
          orders={orders}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
        />
      ) : (
        <OrdersTerminalGridView
          orders={orders}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onCancelOrder={onCancelOrder}
        />
      )}
    </>
  );
}
