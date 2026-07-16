import { useTranslations } from "next-intl";
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
  const t = useTranslations("stamp.customization");

  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
        {t("protocol")}
      </Span>

      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      <div className="space-y-12 mb-12">
        <ColorSwatches
          colors={colors}
          selectedColor={selectedColor}
          isLoading={isLoadingColors}
          hasProduct={hasProduct}
          onSelectColor={onSelectColor}
        />

        {/* Only show size selector if there's more than one size option */}
        {sizes.length > 1 ? (
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelectSize={onSelectSize}
          />
        ) : sizes.length === 1 ? (
          <div>
            <Span
              variant="micro"
              className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-2"
            >
              {t("sizeLabel")}
            </Span>
            <Span variant="sm" className="text-(--color-stamp-chocolate)">
              {sizes[0]}
            </Span>
          </div>
        ) : null}
      </div>

      <div>
        <Button
          onClick={onCreateProduct}
          disabled={!canCreate}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFinalizing ? t("creating") : t("createProduct")}
        </Button>
      </div>
    </div>
  );
}
