import { ColorSelector } from "./ColorSelector";
import ProductCustomizationShimmer from "./ProductCustomizationShimmer";
import { SizeSelector } from "./SizeSelector";

interface ColorOption {
  name: string;
  available: boolean;
}

interface SizeOption {
  name: string;
  available: boolean;
}

interface ProductCustomizationProps {
  isLoading: boolean;
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
}

export function ProductCustomization({
  isLoading,
  colorOptions,
  sizeOptions,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
}: ProductCustomizationProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-purple-200 shadow-lg space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Customize Your Product
      </h3>

      {isLoading ? (
        <ProductCustomizationShimmer />
      ) : (
        <>
          <ColorSelector
            colors={colorOptions}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
          />
          <SizeSelector
            sizes={sizeOptions}
            selectedSize={selectedSize}
            onSizeSelect={onSizeSelect}
          />
        </>
      )}
    </div>
  );
}
