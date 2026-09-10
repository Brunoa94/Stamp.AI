import { getColorHex, getBorderColor, filterDisplayColors } from "../../lib/constants/colorSwatches";
import { Span } from "@/features/ui/span";

/**
 * Color Swatches Component
 *
 * Displays up to 5 color swatches as small rounded circles.
 * Applies smart filtering: shows only White and Black if both are available,
 * otherwise shows all colors (up to maxDisplay).
 */

interface ColorSwatchesProps {
  colors: string[];
  maxDisplay?: number;
}

export function ColorSwatches({ colors, maxDisplay = 5 }: ColorSwatchesProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  // Apply the same filtering logic used in customization:
  // show only White/Black if both available, otherwise all colors
  const filteredColors = filterDisplayColors(colors);
  const displayColors = filteredColors.slice(0, maxDisplay);
  const remainingCount = filteredColors.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5">
      {displayColors.map((colorName, index) => {
        const hex = getColorHex(colorName);
        const borderColor = getBorderColor(hex);

        return (
          <div
            key={`${colorName}-${index}`}
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: hex,
              border: `1px solid ${borderColor}`,
              opacity: hex === "#FFFFFF" ? 0.9 : 1,
            }}
            title={colorName}
          />
        );
      })}
      {remainingCount > 0 && (
        <Span className="ml-0.5 text-[10px] font-mono opacity-50">
          +{remainingCount}
        </Span>
      )}
    </div>
  );
}
