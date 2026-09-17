import type { OrderWithItemsT } from "@/shared/types/order";

export type OrdersPaginationType = {
  page: number;
  totalPages: number;
  startIndex: number;
  paginatedOrders: OrderWithItemsT[];
};
