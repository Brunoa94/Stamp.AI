import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import {
  getAvailableColors,
  MAX_VISIBLE_COLORS,
} from "./utils/prioritizeAvailableColors";
import { getColorClass } from "@/helpers/colors/colorMapping";
import dynamic from "next/dynamic";

const MoreColors = dynamic(() => import("./MoreColors"), { ssr: false });

interface ColorOption {
  name: string;
  available: boolean;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

export function ColorSelector({
  colors,
  selectedColor,
  onColorSelect,
}: ColorSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { hasMore, visibleColors, colorsLength } = getAvailableColors({
    colors,
    isExpanded,
  });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Color
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visibleColors.map((color) => {
          const colorClass = getColorClass(color.name);
          if (!colorClass) return null;

          return (
            <Button
              key={color.name}
              type="button"
              variant="outline"
              onClick={() => color.available && onColorSelect(color.name)}
              disabled={!color.available}
              className={cn(
                "relative h-auto px-3 py-3 justify-start",
                selectedColor === color.name &&
                  color.available &&
                  "border-purple-500 bg-purple-50 dark:bg-purple-900 shadow-md",
                selectedColor !== color.name &&
                  color.available &&
                  "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20",
              )}
              aria-pressed={selectedColor === color.name}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full border-2 border-gray-300 shrink-0",
                  colorClass,
                )}
                aria-hidden="true"
              />
              <span
                className={cn("flex-1 text-left", {
                  "text-purple-700 dark:text-purple-300":
                    selectedColor === color.name && color.available,
                  "text-gray-700 dark:text-gray-300":
                    selectedColor !== color.name && color.available,
                  "text-gray-400": !color.available,
                })}
              >
                {color.name}
              </span>
              {selectedColor === color.name && color.available && (
                <span className="w-2 h-2 bg-purple-500 rounded-full shrink-0" />
              )}
            </Button>
          );
        })}

        <MoreColors
          hasMore={hasMore}
          setIsExpanded={setIsExpanded}
          isExpanded={isExpanded}
          colorsLength={colorsLength}
        />
      </div>
    </div>
  );
}
