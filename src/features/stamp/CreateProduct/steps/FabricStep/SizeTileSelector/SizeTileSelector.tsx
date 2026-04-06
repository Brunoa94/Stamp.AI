"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { CreateProductSelectors } from "../../../context/selectors";
import useProductCustomizerSection from "../../CustomizerStep/ProductCustomizer/hooks/useProductCustomizerSection";
import { SizeTileSelectorSkeleton } from "./SizeTileSelectorSkeleton";

interface SizeOptionI {
  name: string;
  available: boolean;
}

// Static style constants defined outside component for performance
const sizeTileStyles = {
  base: [
    "py-4 sm:w-20 sm:h-20 rounded-xl sm:rounded-lg glass-card",
    "flex items-center justify-center",
    "text-sm sm:text-lg font-heading uppercase tracking-wide",
    "transition-all duration-300",
  ].join(" "),

  hover: "hover:scale-105 hover:shadow-xl",

  disabled: [
    "disabled:opacity-40",
    "disabled:cursor-not-allowed",
    "disabled:hover:scale-100",
  ].join(" "),

  selected: [
    "!border-2 !border-[#7C3AED]",
    "bg-white dark:bg-gray-800",
    "shadow-xl",
    "text-[#7C3AED]",
  ].join(" "),

  unselected: [
    "border-white/40",
    "text-gray-700 dark:text-gray-300",
    "hover:border-purple-300",
  ].join(" "),
};

export function SizeTileSelector() {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const { sizeOptions, selectedSize, setSelectedSize, isLoadingVariants } =
    useProductCustomizerSection({ selectedTshirt });

  if (isLoadingVariants) {
    return <SizeTileSelectorSkeleton />;
  }

  return (
    <div
      className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4"
      role="radiogroup"
      aria-label="Size selection"
    >
      {sizeOptions.map((size: SizeOptionI) => {
        const isSelected = selectedSize === size.name;

        return (
          <Button
            key={size.name}
            type="button"
            variant="ghost"
            onClick={() => size.available && setSelectedSize(size.name)}
            disabled={!size.available}
            className={cn(
              sizeTileStyles.base,
              sizeTileStyles.hover,
              sizeTileStyles.disabled,
              {
                [sizeTileStyles.selected]: isSelected,
                [sizeTileStyles.unselected]: !isSelected,
              },
            )}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Size ${size.name}`}
          >
            {size.name}
          </Button>
        );
      })}
    </div>
  );
}
