"use client";

import { memo } from "react";
import { ChevronRight } from "lucide-react";
import type { OrderWithItemsT } from "@/types/order";
import { formatOrderTotal } from "@/features/orders/helpers/formatOrderTotal";
import { getOrderCardStatusClass } from "@/features/orders/helpers/getOrderCardStatusClass";
import { OrderImage } from "@/features/orders/helpers/OrderImage";
import { ordersCardTheme } from "@/features/orders/styles/ordersTheme";

interface OrderCardPropsI {
  order: OrderWithItemsT;
  onClick: (order: OrderWithItemsT) => void;
}

function OrderCard({ order, onClick }: OrderCardPropsI) {
  const firstItem = order.order_items?.[0];
  const imageUrl = firstItem?.custom_image_url || "/placeholder.png";
  const statusClass = getOrderCardStatusClass(order.status);

  return (
    <button
      type="button"
      onClick={() => onClick(order)}
      className={`${ordersCardTheme.item} w-full text-left cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:shadow-md active:scale-[0.99]`}
    >
      <div className={ordersCardTheme.itemImageWrap}>
        <OrderImage
          src={imageUrl}
          alt={firstItem?.product_name || "Order item"}
          width={56}
          height={56}
          className={ordersCardTheme.itemImage}
        />
      </div>

      <div className="grow">
        <div className="flex justify-between mb-1">
          <h5 className={ordersCardTheme.itemTitle}>
            {firstItem?.product_name || "Custom Design"}
          </h5>
          <span
            className={`${ordersCardTheme.statusBadge} ${statusClass}`}
          >
            {order.status || "Processing"}
          </span>
        </div>
        <p className={ordersCardTheme.itemMeta}>
          Order #{order.order_number}
        </p>
        <span className={ordersCardTheme.itemPrice}>
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
