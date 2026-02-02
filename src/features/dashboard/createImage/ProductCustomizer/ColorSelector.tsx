import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/features/ui/button";
import { getColorClass } from "@/helpers";
import { cn } from "@/lib/utils";

interface ColorOption {
  name: string;
  available: boolean;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

const MAX_VISIBLE_COLORS = 11;

export function ColorSelector({
  colors,
  selectedColor,
  onColorSelect,
}: ColorSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define common color priority order
  const colorPriority: Record<string, number> = {
    black: 1,
    white: 2,
    navy: 3,
    "navy blue": 3,
    gray: 4,
    grey: 4,
    "heather gray": 5,
    "heather grey": 5,
    red: 6,
    blue: 7,
    "royal blue": 8,
    green: 9,
    purple: 10,
    pink: 11,
    yellow: 12,
    orange: 13,
    brown: 14,
    maroon: 15,
    burgundy: 16,
  };

  // Filter out colors that don't have a mapping
  const filteredColors = colors.filter(
    (color) => getColorClass(color.name) !== null,
  );

  // Sort colors by priority (most common first), then alphabetically
  const availableColors = filteredColors.sort((a, b) => {
    const priorityA = colorPriority[a.name.toLowerCase()] || 999;
    const priorityB = colorPriority[b.name.toLowerCase()] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.name.localeCompare(b.name);
  });

  const hasMore = availableColors.length > MAX_VISIBLE_COLORS;
  const visibleColors = isExpanded
    ? availableColors
    : availableColors.slice(0, MAX_VISIBLE_COLORS);

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

        {hasMore && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto py-3"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />+
                {availableColors.length - MAX_VISIBLE_COLORS} More
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
