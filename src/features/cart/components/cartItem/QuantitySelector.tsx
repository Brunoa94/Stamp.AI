import { Minus, Plus } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cartTheme } from "@/theme/components";

interface Props {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  min = 1,
  max = 99,
}: Props) {
  const canDecrement = quantity > min;
  const canIncrement = quantity < max;

  return (
    <div className={cartTheme.item.qtyControl}>
      <Button
        onClick={onDecrement}
        disabled={disabled || !canDecrement}
        variant="outline"
        size="icon-sm"
        className={cartTheme.item.quantityButton}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </Button>

      <span className={cartTheme.item.qtyValue}>{quantity}</span>

      <Button
        onClick={onIncrement}
        disabled={disabled || !canIncrement}
        variant="outline"
        size="icon-sm"
        className={cartTheme.item.quantityButton}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
