"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ordersTheme } from "@/theme/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/features/ui/dialog";
import type { OrderItemT } from "@/types/order";

interface OrderItemsPreviewProps {
  items: OrderItemT[];
  maxDisplay?: number;
  className?: string;
  imageClassName?: string;
}

interface OrderImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

function OrderImage({ src, alt, width, height, className, sizes }: OrderImageProps) {
  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
  };

  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 88}
      height={height ?? 88}
      className={className}
      sizes={sizes}
      onError={handleError}
    />
  );
}

export function OrderItemsPreview({
  items,
  maxDisplay = 1,
  className,
  imageClassName,
}: OrderItemsPreviewProps) {
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
            <button
              key={item.id}
              type="button"
              onClick={() => setZoomedImageUrl(item.custom_image_url)}
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
            </button>
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

      <Dialog
        open={!!zoomedImageUrl}
        onOpenChange={(isOpen) => {
          if (!isOpen) setZoomedImageUrl(null);
        }}
      >
        <DialogContent className="max-w-4xl border border-white/30 bg-slate-950/90 p-3 sm:p-4">
          <DialogTitle className="sr-only">Order item zoom preview</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged view of the selected order item image.
          </DialogDescription>

          {zoomedImageUrl && (
            <div className="relative overflow-hidden rounded-lg bg-black/40">
              <OrderImage
                src={zoomedImageUrl}
                alt="Zoomed order item"
                width={1200}
                height={1200}
                className="h-auto max-h-[78vh] w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 1000px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
