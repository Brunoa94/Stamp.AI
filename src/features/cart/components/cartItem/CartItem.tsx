"use client";

import Image from "next/image";
import { Button } from "@/features/ui/button";
import { CartItem as CartItemT } from "@/types/cart";
import { QuantitySelector } from "./QuantitySelector";
import { cartTheme } from "@/theme/components";
import clsx from "clsx";

interface Props {
  item: CartItemT;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: Props) {
  const itemTotal = item.unit_price * item.quantity;

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div
      className={clsx(
        cartTheme.item.card,
        isUpdating && "opacity-50 pointer-events-none",
      )}
    >
      <div className={cartTheme.item.imageWrap}>
        {item.custom_image_url ? (
          <Image
            src={item.custom_image_url}
            alt={item.product?.name || "Product"}
            width={128}
            height={128}
            className={cartTheme.item.image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      <div className={cartTheme.item.details}>
        <h3 className={cartTheme.item.title}>
          {item.product_name || item.product?.name || "Custom Design"}
        </h3>

        <p className={cartTheme.item.subtitle}>
          {item.product?.name ? "Premium Cotton" : "Custom Product"}
          {item.variant?.name ? ` • ${item.variant.name}` : ""}
        </p>

        <div className={cartTheme.item.chipsRow}>
          <span className={cartTheme.item.chip}>QTY: {item.quantity}</span>
          {item.variant?.name && (
            <span className={cartTheme.item.chip}>{item.variant.name}</span>
          )}
        </div>
      </div>

      <div className={cartTheme.item.qtyPriceWrap}>
        <QuantitySelector
          quantity={item.quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          disabled={isUpdating}
        />
        <span className={cartTheme.item.price}>${itemTotal.toFixed(2)}</span>
        <Button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          variant="ghost"
          size="sm"
          className={cartTheme.item.remove}
          aria-label="Remove item"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
