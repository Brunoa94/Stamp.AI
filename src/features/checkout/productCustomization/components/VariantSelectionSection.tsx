import clsx from "clsx";
import { CatalogBlueprintT, VariantInfoT } from "@/schemas/checkout";

interface Props {
  selectedBlueprint: CatalogBlueprintT;
  blueprintVariants: VariantInfoT[];
  availableColors: string[];
  availableSizes: string[];
  selectedColor: string | null;
  selectedSize: string | null;
  selectedVariantId: number | null;
  loadingVariants: boolean;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  getSizesForColor: (color: string) => string[];
}

const VariantSelectionSection = ({
  selectedBlueprint,
  blueprintVariants,
  availableColors,
  availableSizes,
  selectedColor,
  selectedSize,
  selectedVariantId,
  loadingVariants,
  onColorSelect,
  onSizeSelect,
  getSizesForColor,
}: Props) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <header className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span
            className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
            aria-hidden="true"
          >
            3
          </span>
          Select Color & Size
        </h3>
      </header>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Selected:</strong> {selectedBlueprint.title}
        </p>
        <p className="text-blue-600 text-xs mt-1">
          {selectedBlueprint.brand} • Print areas:{" "}
          {selectedBlueprint.printAreas.map((a) => a.position).join(", ")}
        </p>
      </div>

      {loadingVariants ? (
        <div
          className="flex items-center gap-2 text-gray-500"
          role="status"
          aria-live="polite"
        >
          <div
            className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"
            aria-hidden="true"
          />
          <span>Loading options...</span>
        </div>
      ) : (
        <>
          {/* Color Selection */}
          <div className="mb-6">
            <label
              htmlFor="color-selection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Color ({availableColors.length} available)
            </label>
            <div
              id="color-selection"
              className="flex flex-wrap gap-2 max-h-40 overflow-y-auto"
              role="radiogroup"
              aria-label="Color selection"
            >
              {availableColors.map((color) => {
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    onClick={() => {
                      onColorSelect(color);
                      onSizeSelect("");
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    className={clsx(
                      "px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      {
                        "border-blue-500 bg-blue-50 text-blue-700 font-medium":
                          isSelected,
                        "border-gray-200 hover:border-gray-300": !isSelected,
                      }
                    )}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          {selectedColor && (
            <div className="mb-6">
              <label
                htmlFor="size-selection"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Size
              </label>
              <div
                id="size-selection"
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Size selection"
              >
                {getSizesForColor(selectedColor).map((size) => {
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => onSizeSelect(size)}
                      role="radio"
                      aria-checked={isSelected}
                      className={clsx(
                        "px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        {
                          "border-blue-500 bg-blue-50 text-blue-700 font-medium":
                            isSelected,
                          "border-gray-200 hover:border-gray-300": !isSelected,
                        }
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected summary */}
          {selectedColor && selectedSize && selectedVariantId && (
            <div
              className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2"
              role="status"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Selected: {selectedColor} / {selectedSize}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default VariantSelectionSection;
