import { useState } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { buildProductSections } from "../../../lib/helpers/productSectionHelpers";
import { ProductCard } from "./ProductCard";
import { ProductSectionPicker } from "./ProductSectionPicker";
import { SelectedProductCard } from "./SelectedProductCard";
import type {
  CatalogProductMappedT,
  ProductSectionIdT,
} from "../../../lib/types/stampTypes";
import { SplitToneText } from "../../components/SplitToneText";

/**
 * ProductGrid
 *
 * The product step's right panel. It opens with the section picker
 * (apparel, accessories), then the products of the chosen section. Once a
 * product is picked, only that product is shown. Handles the loading,
 * error and empty states.
 */

interface PropsI {
  clothingProducts: CatalogProductMappedT[];
  accessoryProducts: CatalogProductMappedT[];
  selectedProduct: CatalogProductMappedT | undefined;
  isLoading: boolean;
  isError: boolean;
  onProductSelect: (product: CatalogProductMappedT) => void;
  onClearSelection: () => void;
}

export function ProductGrid({
  clothingProducts,
  accessoryProducts,
  selectedProduct,
  isLoading,
  isError,
  onProductSelect,
  onClearSelection,
}: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const [chosenSectionId, setChosenSectionId] = useState<ProductSectionIdT>("apparel");
  const sections = buildProductSections(clothingProducts, accessoryProducts);
  // Falls back to the first section when the chosen one has no products
  const activeSection =
    sections.find((section) => section.id === chosenSectionId) ?? sections[0];

  return (
    <div className="flex-1 md:h-full min-h-0 overflow-y-auto overflow-x-hidden bg-(--color-stamp-cream)/20 md:bg-transparent pb-40 md:pb-0">
      {isLoading && (
        <div
          className="h-full w-full flex items-center justify-center"
          aria-busy="true"
          aria-label={t("loadingAria")}
        >
          <div className="space-y-4 w-full p-8 lg:p-10">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="h-32 bg-(--color-stamp-divider)/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="h-full w-full flex flex-col items-center justify-center p-12 text-center"
        >
          <Span variant="micro" className="text-red-500 mb-2">
            {t("loadError")}
          </Span>
          <Paragraph variant="sm">
            <SplitToneText tone="muted">{t("loadErrorHint")}</SplitToneText>
          </Paragraph>
        </div>
      )}

      {!isLoading && !isError && !activeSection && (
        <div
          role="status"
          className="h-full w-full flex items-center justify-center p-12 text-center"
        >
          <Span variant="micro">
            <SplitToneText tone="muted">{t("empty")}</SplitToneText>
          </Span>
        </div>
      )}

      {!isLoading && !isError && activeSection && (
        selectedProduct ? (
          // min-h-full, not h-full: a card taller than the panel grows it (and scrolls) instead of being squeezed and clipped
          <div className="w-full min-h-full p-4 lg:p-6 flex flex-col justify-center">
            <SelectedProductCard
              product={selectedProduct}
              onClearSelection={onClearSelection}
            />
          </div>
        ) : (
          <div className="w-full p-4 lg:p-6 space-y-5">
            <ProductSectionPicker
              sections={sections}
              activeSectionId={activeSection.id}
              onSectionChange={setChosenSectionId}
            />
            <div className="grid grid-cols-2 gap-3">
              {activeSection.products.map((product) => (
                <ProductCard
                  key={product.blueprintId}
                  product={product}
                  isSelected={false}
                  onSelect={onProductSelect}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
