import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ordersTheme } from "@/theme/components";
import type { OrderItemT } from "@/types/order";

interface OrderItemsPreviewProps {
  items: OrderItemT[];
  maxDisplay?: number;
  className?: string;
}

export function OrderItemsPreview({
  items,
  maxDisplay = 1,
  className,
}: OrderItemsPreviewProps) {
  const itemCount = items?.length || 0;
  const displayItems = items?.slice(0, maxDisplay) || [];
  const remainingCount = itemCount - maxDisplay;

  if (itemCount === 0) {
    return (
      <div className={cn(ordersTheme.table.itemsStack, className)}>
        <div
          className={cn(
            ordersTheme.table.itemImage,
            "flex items-center justify-center bg-slate-100",
          )}
        >
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(ordersTheme.table.itemsStack, className)}>
      {displayItems.map((item) =>
        item.custom_image_url ? (
          <Image
            key={item.id}
            src={item.custom_image_url}
            alt="Order item"
            width={56}
            height={56}
            className={ordersTheme.table.itemImage}
            onError={(e) => {
              // Hide broken images gracefully
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            key={item.id}
            className={cn(
              ordersTheme.table.itemImage,
              "flex items-center justify-center bg-slate-100",
            )}
          >
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
        ),
      )}
      {remainingCount > 0 && (
        <div className={ordersTheme.table.itemBadge}>+{remainingCount}</div>
      )}
    </div>
  );
}
