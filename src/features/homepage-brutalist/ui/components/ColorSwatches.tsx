import { getColorHex, getBorderColor } from "../../lib/constants/colorSwatches";
import { Span } from "@/features/ui/span";

/**
 * Color Swatches Component
 *
 * Displays up to 5 color swatches as small rounded circles
 *
 * Features:
 * - Max 5 colors displayed
 * - Rounded circles (16x16px)
 * - Adaptive border (black/white based on color luminance)
 * - "+X more" indicator if more than 5 colors
 */

interface ColorSwatchesProps {
  colors: string[];
  maxDisplay?: number;
}

export function ColorSwatches({ colors, maxDisplay = 5 }: ColorSwatchesProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  const displayColors = colors.slice(0, maxDisplay);
  const remainingCount = colors.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5">
      {displayColors.map((colorName, index) => {
        const hex = getColorHex(colorName);
        const borderColor = getBorderColor(hex);

        return (
          <div
            key={`${colorName}-${index}`}
            className="w-4 h-4 rounded-full"
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
        <Span className="text-[10px] font-mono opacity-50 ml-0.5">
          +{remainingCount}
        </Span>
      )}
    </div>
  );
}
