/**
 * Types for the Orders Terminal feature
 * All types follow the naming convention with Type suffix
 */

import { OrderStatusFilterT, OrderWithItemsT } from "@/types/order";

/**
 * View mode for orders display
 */
export type OrdersViewModeType = "list" | "grid";

/**
 * Pagination state for orders
 */
export type OrdersPaginationType = {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
};

/**
 * Order action handlers
 */
export type OrderActionsType = {
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
};

/**
 * Possible persisted order statuses received from the backend.
 */
export type OrderStatusType =
  Exclude<OrderStatusFilterT, "all"> | null | undefined;

/**
 * Status configuration for order cards
 */
export type OrderStatusConfigType = {
  /** Complete static badge classes (background, border and text color) */
  badgeClass: string;
  hoverBg: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};
