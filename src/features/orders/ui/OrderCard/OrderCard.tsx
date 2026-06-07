"use client";

import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import type { OrderWithItemsT } from "@/types/order";

interface OrderCardProps {
  order: OrderWithItemsT;
  onClick: (order: OrderWithItemsT) => void;
}

function formatOrderTotal(amount?: number | null) {
  if (!amount && amount !== 0) return "$0.00";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase() || "processing";
  if (normalized.includes("delivered")) {
    return dashboardTheme.orders.statusDelivered;
  }
  if (normalized.includes("shipped")) {
    return dashboardTheme.orders.statusShipped;
  }
  if (normalized.includes("cancel")) {
    return dashboardTheme.orders.statusCancelled;
  }
  return dashboardTheme.orders.statusProcessing;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const firstItem = order.order_items?.[0];
  const imageUrl = firstItem?.custom_image_url || "/placeholder.png";
  const statusClass = getStatusClass(order.status);

  return (
    <button
      type="button"
      onClick={() => onClick(order)}
      className={`${dashboardTheme.orders.item} w-full text-left cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:shadow-md active:scale-[0.99]`}
    >
      <div className={dashboardTheme.orders.itemImageWrap}>
        <img
          src={imageUrl}
          alt={firstItem?.product_name || "Order item"}
          className={dashboardTheme.orders.itemImage}
        />
      </div>
      <div className="grow">
        <div className="flex justify-between mb-1">
          <h5 className={dashboardTheme.orders.itemTitle}>
            {firstItem?.product_name || "Custom Design"}
          </h5>
          <span className={`${dashboardTheme.orders.statusBadge} ${statusClass}`}>
            {order.status || "Processing"}
          </span>
        </div>
        <p className={dashboardTheme.orders.itemMeta}>
          Order #{order.order_number}
        </p>
        <span className={dashboardTheme.orders.itemPrice}>
          {formatOrderTotal(order.total_amount)}
        </span>
      </div>
      <div className="p-2 text-gray-400 group-hover:text-[#7C3AED] transition-colors">
        <ChevronRight className="text-2xl" />
      </div>
    </button>
  );
}

export const MemoizedOrderCard = memo(OrderCard);
