"use client";

import { memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getColorClass } from "@/helpers/colors/colorMapping";
import { Button } from "@/features/ui/button";
import { CreateProductSelectors } from "../../context/selectors";
import useProductCustomizerSection from "../CustomizerStep/ProductCustomizer/hooks/useProductCustomizerSection";

interface ColorOptionI {
  name: string;
  available: boolean;
}

interface ColorSwatchButtonProps {
  color: ColorOptionI;
  isSelected: boolean;
  onSelect: (colorName: string, isAvailable: boolean) => void;
}

const ColorSwatchButton = memo(function ColorSwatchButton({
  color,
  isSelected,
  onSelect,
}: ColorSwatchButtonProps) {
  const colorClass = getColorClass(color.name);
  if (!colorClass) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(color.name, color.available)}
      disabled={!color.available}
      className={cn(
        "w-16 h-16 rounded-full border-4 border-white shadow-xl transition-all duration-300",
        "hover:scale-110 hover:shadow-2xl",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        colorClass,
        isSelected && "ring-4 ring-[#7C3AED] scale-110",
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={color.name}
      title={color.name}
    />
  );
});

export function ColorSwatchSelector() {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const { colorOptions, selectedColor, setSelectedColor, isLoadingVariants } =
    useProductCustomizerSection({ selectedTshirt });

  const availableColorOptions = useMemo(
    () => colorOptions.filter((color) => !!getColorClass(color.name)),
    [colorOptions],
  );

  const handleSelectColor = useCallback(
    (colorName: string, isAvailable: boolean) => {
      if (!isAvailable) {
        return;
      }

      setSelectedColor(colorName);
    },
    [setSelectedColor],
  );

  if (isLoadingVariants) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-4"
      role="radiogroup"
      aria-label="Color selection"
    >
      {availableColorOptions.map((color) => (
        <ColorSwatchButton
          key={color.name}
          color={color}
          isSelected={selectedColor === color.name}
          onSelect={handleSelectColor}
        />
      ))}
    </div>
  );
}

export const MemoizedColorSwatchSelector = memo(ColorSwatchSelector);
