import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { ColorSwatches } from "./ColorSwatches";
import { SizeSelector } from "./SizeSelector";
import type { SizeType } from "../../../lib/types/stampTypes";

/**
 * CustomizationControls
 *
 * Right panel with customization controls
 */

interface PropsI {
  colors: string[];
  selectedColor?: string;
  sizes: SizeType[];
  selectedSize: SizeType;
  isLoadingColors: boolean;
  hasProduct: boolean;
  canCreate: boolean;
  isFinalizing: boolean;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: SizeType) => void;
  onCreateProduct: () => void;
}

export function CustomizationControls({
  colors,
  selectedColor,
  sizes,
  selectedSize,
  isLoadingColors,
  hasProduct,
  canCreate,
  isFinalizing,
  onSelectColor,
  onSelectSize,
  onCreateProduct,
}: PropsI) {
  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
        Protocol 06 / Refinement
      </Span>

      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        Customize Your{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          Product
        </span>
      </Heading>

      <div className="space-y-12 mb-12">
        <ColorSwatches
          colors={colors}
          selectedColor={selectedColor}
          isLoading={isLoadingColors}
          hasProduct={hasProduct}
          onSelectColor={onSelectColor}
        />

        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelectSize={onSelectSize}
        />
      </div>

      <div>
        <Button
          onClick={onCreateProduct}
          disabled={!canCreate}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFinalizing ? "CREATING..." : "CREATE PRODUCT"}
        </Button>
      </div>
    </div>
  );
}
