import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { OrderWithItemsT } from "@/types/order";
import { OrderCardImage } from "./OrderCardImage";
import { OrderCardInfo } from "./OrderCardInfo";
import { OrderCardStatus } from "./OrderCardStatus";
import { OrderCardFooter } from "./OrderCardFooter";

interface Props {
  order: OrderWithItemsT;
  onViewDetails: (order: OrderWithItemsT) => void;
}

export function OrderCard({ order, onViewDetails }: Props) {
  const formattedDate = order.created_at
    ? format(new Date(order.created_at), "MMM dd, yyyy")
    : "N/A";
  const itemCount = order.order_items?.length || 0;
  const firstProductImage = order.order_items?.[0]?.custom_image_url;

  return (
    <article
      className={cn(
        "bg-white dark:bg-gray-800 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 rounded-2xl",
        "p-0 group transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer overflow-hidden"
      )}
      onClick={() => onViewDetails(order)}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Product Image + Order Info */}
          <div className="flex items-center gap-4">
            <OrderCardImage
              imageUrl={firstProductImage}
              productName={order.order_items[0]?.product_name || "Product"}
            />
            <OrderCardInfo
              orderNumber={order.order_number}
              formattedDate={formattedDate}
              customerName={order.customer_name}
              itemCount={itemCount}
            />
          </div>

          {/* Right: Status Badges */}
          <OrderCardStatus
            orderStatus={order.status}
            paymentStatus={order.payment_status}
          />
        </div>
      </div>

      {/* Footer / Actions */}
      <OrderCardFooter
        totalAmount={order.total_amount}
        onViewDetails={(e) => {
          e.stopPropagation();
          onViewDetails(order);
        }}
      />
    </article>
  );
}
