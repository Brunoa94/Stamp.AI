import { Minus, Plus } from "lucide-react";
import { componentThemes } from "@/theme";
import clsx from "clsx";

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
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={disabled || !canDecrement}
        className={clsx(
          "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
          "border border-gray-300",
          disabled || !canDecrement
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-12 text-center font-medium text-gray-900">
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        disabled={disabled || !canIncrement}
        className={clsx(
          "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
          "border border-gray-300",
          disabled || !canIncrement
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
