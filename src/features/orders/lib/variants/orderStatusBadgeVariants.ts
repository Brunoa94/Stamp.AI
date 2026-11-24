import { cva } from "class-variance-authority";

/**
 * Shape of an order status badge (rounded-md, compact padding). Pair it with
 * `Span variant="badge"` for the uppercase tracked label and with
 * `getStatusBadgeClass(status)` for the status colours.
 */
export const orderStatusBadgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-md px-2 py-1",
);
