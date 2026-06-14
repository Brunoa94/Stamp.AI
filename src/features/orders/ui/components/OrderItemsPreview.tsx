"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { ordersTheme } from "@/theme/components";
import { OrderImage } from "../../helpers/OrderImage";
import type { OrderItemT } from "@/types/order";
import { OrderItemZoomDialog } from "./OrderItemZoomDialog";

interface PropsI {
  items: OrderItemT[];
  maxDisplay?: number;
  className?: string;
  imageClassName?: string;
}

export function OrderItemsPreview({
  items,
  maxDisplay = 1,
  className,
  imageClassName,
}: PropsI) {
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const itemCount = items?.length || 0;
  const displayItems = items?.slice(0, maxDisplay) || [];
  const remainingCount = itemCount - maxDisplay;

  if (itemCount === 0) {
    return (
      <div className={cn(ordersTheme.table.itemsStack, className)}>
        <div
          className={cn(
            ordersTheme.table.itemImage,
            imageClassName,
            "flex items-center justify-center bg-slate-100",
          )}
        >
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(ordersTheme.table.itemsStack, className)}>
        {displayItems.map((item) =>
          item.custom_image_url ? (
            <Button
              key={item.id}
              onClick={() => setZoomedImageUrl(item.custom_image_url)}
              variant="ghost"
              size="icon"
              className={cn(
                ordersTheme.table.itemImage,
                imageClassName,
                "group cursor-zoom-in overflow-hidden transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/60",
              )}
              aria-label="Open item image zoom"
            >
              <OrderImage
                src={item.custom_image_url}
                alt="Order item"
                width={88}
                height={88}
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              />
            </Button>
          ) : (
            <div
              key={item.id}
              className={cn(
                ordersTheme.table.itemImage,
                imageClassName,
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

      <OrderItemZoomDialog
        imageUrl={zoomedImageUrl}
        onRequestClose={() => setZoomedImageUrl(null)}
      />
    </>
  );
}
