"use client";

import { CartItem as CartItemT } from "@/types/cart";
import { CartItem } from "../cartItem";
import { cartTheme } from "@/theme/components";

interface Props {
  items: CartItemT[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartList({
  items,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
