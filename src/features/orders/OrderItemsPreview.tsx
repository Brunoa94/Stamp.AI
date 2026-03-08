import Image from "next/image";
import { ordersTheme } from "@/theme/components";
import type { OrderItemT } from "@/types/order";

interface OrderItemsPreviewProps {
  items: OrderItemT[];
  maxDisplay?: number;
}

export function OrderItemsPreview({
  items,
  maxDisplay = 1,
}: OrderItemsPreviewProps) {
  const itemCount = items?.length || 0;
  const displayItems = items?.slice(0, maxDisplay) || [];
  const remainingCount = itemCount - maxDisplay;

  return (
    <div className={ordersTheme.table.itemsStack}>
      {displayItems.map((item) => (
        <Image
          key={item.id}
          src={item.custom_image_url || "/placeholder.png"}
          alt="Order item"
          width={40}
          height={40}
          className={ordersTheme.table.itemImage}
        />
      ))}
      {remainingCount > 0 && (
        <div className={ordersTheme.table.itemBadge}>+{remainingCount}</div>
      )}
    </div>
  );
}
