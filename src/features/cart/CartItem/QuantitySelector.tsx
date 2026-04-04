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
        variant="ghost"
        size="icon-sm"
        onClick={onDecrement}
        disabled={disabled || !canDecrement}
        className={cartTheme.item.qtyButton}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3" aria-hidden="true" />
      </Button>

      <span className={cartTheme.item.qtyValue}>{quantity}</span>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onIncrement}
        disabled={disabled || !canIncrement}
        className={cartTheme.item.qtyButton}
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" aria-hidden="true" />
      </Button>
    </div>
  );
}
