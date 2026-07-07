"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { OrderImage } from "../../helpers/OrderImage";
import type { OrderItemT } from "@/types/order";
import { OrderItemZoomDialog } from "./OrderItemZoomDialog";

const stackClass = "flex -space-x-3 overflow-hidden";
const imageClass =
  "inline-block h-14 w-14 rounded-lg ring-2 ring-white object-cover bg-concrete";

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
      <div className={cn(stackClass, className)}>
        <div
          className={cn(
            imageClass,
            imageClassName,
            "flex items-center justify-center",
          )}
        >
          <ShoppingBag className="w-4 h-4 text-ink/40" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(stackClass, className)}>
        {displayItems.map((item) =>
          item.custom_image_url ? (
            <Button
              key={item.id}
              onClick={() => setZoomedImageUrl(item.custom_image_url)}
              variant="ghost"
              size="icon"
              className={cn(
                imageClass,
                imageClassName,
                "group cursor-zoom-in overflow-hidden transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60",
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
                imageClass,
                imageClassName,
                "flex items-center justify-center",
              )}
            >
              <ShoppingBag className="w-4 h-4 text-ink/40" />
            </div>
          ),
        )}
        {remainingCount > 0 && (
          <Span
            variant="sm"
            className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-white ring-2 ring-white"
          >
            +{remainingCount}
          </Span>
        )}
      </div>

      <OrderItemZoomDialog
        imageUrl={zoomedImageUrl}
        onRequestClose={() => setZoomedImageUrl(null)}
      />
    </>
  );
}
