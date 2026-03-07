"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { CreateProductSelectors } from "../../context/selectors";
import useProductCustomizerSection from "../CustomizerStep/ProductCustomizer/hooks/useProductCustomizerSection";

interface SizeOptionI {
  name: string;
  available: boolean;
}

export function SizeTileSelector() {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const { sizeOptions, selectedSize, setSelectedSize, isLoadingVariants } =
    useProductCustomizerSection({ selectedTshirt });

  if (isLoadingVariants) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-4"
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
              "w-20 h-20 rounded-lg glass-card transition-all duration-300",
              "flex items-center justify-center",
              "text-lg font-heading uppercase tracking-wide",
              "hover:scale-105 hover:shadow-xl",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
              isSelected
                ? "border-[#7C3AED] bg-white dark:bg-gray-800 shadow-xl ring-2 ring-[#7C3AED] text-[#7C3AED]"
                : "border-white/40 text-gray-700 dark:text-gray-300 hover:border-purple-300",
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
