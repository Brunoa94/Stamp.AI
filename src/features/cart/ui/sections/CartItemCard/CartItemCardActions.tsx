/**
 * CartItemCardActions
 *
 * Quantity stepper and remove control for a cart line item.
 */

"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { CartItem } from "@/types/cart";
import { MAX_QUANTITY, MIN_QUANTITY } from "../../../lib/constants/quantity";

interface CartItemCardActionsPropsI {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemCardActions({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardActionsPropsI) {
  const productName =
    item.product_name || item.product?.name || "Custom Product";
  const quantity = item.quantity ?? 1;

  const handleIncrement = () => {
    if (quantity < MAX_QUANTITY) {
      onUpdateQuantity(item.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > MIN_QUANTITY) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-start gap-6 border-t border-(--color-stamp-divider) pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="flex items-center border border-(--color-stamp-divider)"
        role="group"
        aria-label={`Quantity for ${productName}`}
      >
        <Button
          onClick={handleDecrement}
          disabled={quantity <= MIN_QUANTITY}
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          className="h-10 w-10 rounded-none font-heading text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Span
          unstyled
          className="w-12 text-center text-sm font-heading font-bold tabular-nums"
          aria-live="polite"
        >
          {quantity}
        </Span>
        <Button
          onClick={handleIncrement}
          disabled={quantity >= MAX_QUANTITY}
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          className="h-10 w-10 rounded-none font-heading text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        onClick={() => onRemove(item.id)}
        variant="ghost"
        className="h-auto gap-2 rounded-none p-0 font-heading text-(--color-stamp-error) hover:bg-transparent hover:underline"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <Span
          variant="micro"
          unstyled
          className="text-[10px] font-heading font-bold uppercase tracking-[0.2em]"
        >
          Remove
        </Span>
      </Button>
    </div>
  );
}
