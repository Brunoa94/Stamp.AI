import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { OrderWithItemsT } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme";

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
        componentThemes.card.elevated,
        "p-0 group transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border-purple-100/50"
      )}
      onClick={() => onViewDetails(order)}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Product Image + Order Info */}
          <div className="flex items-center gap-4">
            {/* Product Image */}
            {firstProductImage && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-100 flex-shrink-0">
                <Image
                  src={firstProductImage}
                  alt={order.order_items[0]?.product_name || "Product"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}

            {/* Order Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Order #{order.order_number}
                </h3>
                <span className="text-sm text-gray-400">•</span>
                <p className="text-sm font-medium text-gray-500">{formattedDate}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                 {order.customer_name && (
                  <>
                    <span className="font-medium text-gray-700">{order.customer_name}</span>
                    <span className="text-gray-300">|</span>
                  </>
                )}
                <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>
            </div>
          </div>

          {/* Right: Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {order.status && (
              <OrderStatusBadge status={order.status} variant="order" />
            )}
            {order.payment_status && (
              <OrderStatusBadge status={order.payment_status} variant="payment" />
            )}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-purple-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${order.total_amount?.toFixed(2) || "0.00"}
          </span>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order);
          }}
          variant="ghost"
          className="group/btn text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium"
        >
          View Details
          <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </article>
  );
}
