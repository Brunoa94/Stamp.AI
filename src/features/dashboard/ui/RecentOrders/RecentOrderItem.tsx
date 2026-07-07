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

  // Get status color for hover border
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "hover:bg-green/10 hover:border-l-4 hover:border-l-green";
      case "shipped":
        return "hover:bg-cyan/10 hover:border-l-4 hover:border-l-cyan";
      case "processing":
        return "hover:bg-orange/10 hover:border-l-4 hover:border-l-orange";
      default:
        return "hover:bg-purple/10 hover:border-l-4 hover:border-l-purple";
    }
  };

  return (
    <div
      onClick={() => onClick(order)}
      className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 group cursor-pointer hover:bg-opacity-10 transition-all border-l-0 ${getStatusColor(order.status ?? 'pending')}`}
    >
      <div className="flex items-center gap-6">
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

      <div className="flex items-center gap-8 justify-between">
        <RecentOrderItemPrice amount={totalAmount} />
        <RecentOrderItemStatus status={order.status ?? 'pending'} />
        <ChevronRight className="w-5 h-5 text-ink/20 group-hover:text-current transition-all" />
      </div>
    </div>
  );
}
