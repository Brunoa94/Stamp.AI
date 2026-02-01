"use client";

import { CartItemWithProduct } from "@/types/cart";
import { CartItem } from "../cartItem";

interface Props {
  items: CartItemWithProduct[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartList({ items, onUpdateQuantity, onRemove, isUpdating = false }: Props) {
  return (
    <div className="space-y-4">
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
