/**
 * Orders Terminal Pagination Component
 */

import { OrdersPaginationType } from "../../types/orders-terminal";
import { OrdersTerminalPaginationDesktop } from "./OrdersTerminalPaginationDesktop";
import { OrdersTerminalPaginationMobile } from "./OrdersTerminalPaginationMobile";

interface PropsI extends OrdersPaginationType {
  onPageChange: (page: number) => void;
}
export function OrdersTerminalPagination(props: PropsI) {
  return (
    <>
      <OrdersTerminalPaginationMobile {...props} />
      <OrdersTerminalPaginationDesktop {...props} />
    </>
  );
}
