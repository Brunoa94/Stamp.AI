import { Button } from "@/features/ui/button";
import { QuantitySelector } from "./QuantitySelector";
import { cartTheme } from "@/theme/components";

interface Props {
  itemTotal: number;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  isUpdating: boolean;
}

export function CartItemDesktopControls({
  itemTotal,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
  isUpdating,
}: Props) {
  return (
    <div className={cartTheme.item.qtyPriceWrap}>
      <QuantitySelector
        quantity={quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        disabled={isUpdating}
      />
      <span className={cartTheme.item.price}>${itemTotal.toFixed(2)}</span>
      <Button
        variant="ghost"
        onClick={onRemove}
        disabled={isUpdating}
        className={cartTheme.item.remove}
        aria-label="Remove item"
      >
        Remove
      </Button>
    </div>
  );
}
