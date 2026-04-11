import { cn } from "@/lib/utils";

type BadgeVariant = "order" | "payment" | "fulfillment";

interface Props {
  status: string;
  variant: BadgeVariant;
}

const statusColors: Record<string, string> = {
  // Order status
  waiting_payment: "bg-yellow-50 text-yellow-700 border-yellow-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",

  // Payment status
  paid: "bg-green-50 text-green-700 border-green-200",
  unpaid: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",

  // Fulfillment status
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  unfulfilled: "bg-orange-50 text-orange-700 border-orange-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-slate-50 text-slate-700 border-slate-200",
};

const variantLabels: Record<BadgeVariant, string> = {
  order: "Order",
  payment: "Payment",
  fulfillment: "Fulfillment",
};

export function OrderStatusBadge({ status, variant }: Props) {
  const normalizedStatus = String(status || "").toLowerCase();
  const colorClass =
    statusColors[normalizedStatus] ||
    "bg-gray-100 text-gray-800 border-gray-300";
  const label = variantLabels[variant];
  const displayStatus = String(status || "unknown")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border",
        colorClass,
      )}
      role="status"
      aria-label={`${label} status: ${displayStatus}`}
    >
      {displayStatus}
    </span>
  );
}
