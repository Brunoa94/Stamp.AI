import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import type { OrderWithItemsT } from "@/types/order";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  order: OrderWithItemsT;
  firstItem: ReturnType<typeof getFirstOrderItem>;
  onOpenDetails: (order: OrderWithItemsT) => void;
}

export function OrdersGridItemImage({
  order,
  firstItem,
  onOpenDetails,
}: PropsI) {
  return (
    <Button
      onClick={() => onOpenDetails(order)}
      variant="ghost"
      className="relative h-40 w-full overflow-hidden bg-(--color-stamp-cream)"
      aria-label={`Open details for order ${order.order_number || order.id}`}
    >
      {firstItem?.custom_image_url ? (
        <Image
          src={firstItem.custom_image_url}
          alt={firstItem.product_name || "Order product"}
          fill
          sizes="(max-width: 768px) 100vw, 240px"
          className="object-cover transition-all duration-1000 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-(--color-stamp-taupe)">
          <ShoppingBag className="h-10 w-10" />
        </div>
      )}
    </Button>
  );
}
