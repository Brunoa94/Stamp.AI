import type { OrderWithItemsT } from "@/types/order";

export type OrdersPaginationType = {
  page: number;
  totalPages: number;
  startIndex: number;
  paginatedOrders: OrderWithItemsT[];
};
