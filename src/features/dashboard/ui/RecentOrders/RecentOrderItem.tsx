import { ChevronRight } from "lucide-react";
import type { OrderWithItemsT } from "@/types/order";
import { RecentOrderItemThumbnail } from "./RecentOrderItemThumbnail";
import { RecentOrderItemInfo } from "./RecentOrderItemInfo";
import { RecentOrderItemPrice } from "./RecentOrderItemPrice";
import { RecentOrderItemStatus } from "./RecentOrderItemStatus";

interface PropsI {
  order: OrderWithItemsT;
  onClick: (order: OrderWithItemsT) => void;
}

export function RecentOrderItem({ order, onClick }: PropsI) {
  const firstItem = order.order_items?.[0];
  const totalAmount = order.total_amount || 0;
  const productName = firstItem?.product_name || "CUSTOM DESIGN";

  return (
    <div
      onClick={() => onClick(order)}
      className="flex items-center justify-between p-4 border-b border-ink/5 hover:bg-ink/2 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <RecentOrderItemThumbnail
          imageUrl={firstItem?.custom_image_url}
          productName={productName}
        />
        <RecentOrderItemInfo
          orderId={order.id}
          createdAt={order.created_at}
          productName={productName}
        />
      </div>

      <div className="flex items-center gap-4">
        <RecentOrderItemPrice amount={totalAmount} />
        <RecentOrderItemStatus status={order.status} />
        <ChevronRight className="w-4 h-4 text-ink/20 group-hover:text-ink/40 transition-colors" />
      </div>
    </div>
  );
}
