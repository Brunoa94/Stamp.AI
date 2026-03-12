import { X } from "lucide-react";
import { CartItem as CartItemT } from "@/types/cart";
import { Button } from "@/features/ui/button";
import { QuantitySelector } from "./QuantitySelector";
import { cartTheme } from "@/theme/components";

interface Props {
  item: CartItemT;
  itemTotal: number;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  isUpdating: boolean;
}

export function CartItemDetails({
  item,
  itemTotal,
  onRemove,
  onIncrement,
  onDecrement,
  isUpdating,
}: Props) {
  return (
    <div className={cartTheme.item.details}>
      <div className={cartTheme.item.header}>
        <h3 className={cartTheme.item.title}>
          {item.product_name || item.product?.name || "Custom Design"}
        </h3>
        {/* Mobile remove button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={isUpdating}
          className={cartTheme.item.removeButton}
          aria-label="Remove item"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <p className={cartTheme.item.meta}>{item.variant?.name || "Standard"}</p>

      {/* Desktop: Variant chips */}
      <div className={cartTheme.item.chipsRow}>
        {item.variant?.name && (
          <span className={cartTheme.item.chip}>{item.variant.name}</span>
        )}
        <span className={cartTheme.item.chip}>Qty: {item.quantity}</span>
        <span className={cartTheme.item.chip}>
          ${item.unit_price.toFixed(2)} each
        </span>
      </div>

      {/* Mobile: Price and quantity row */}
      <div className={cartTheme.item.priceRow}>
        <span className={cartTheme.item.price}>${itemTotal.toFixed(2)}</span>
        <QuantitySelector
          quantity={item.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}
