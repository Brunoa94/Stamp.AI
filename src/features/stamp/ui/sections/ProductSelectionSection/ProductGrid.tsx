import { useState } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { ProductCard } from "./ProductCard";
import { ProductGroupToolbar } from "./ProductGroupToolbar";
import { SelectedProductCard } from "./SelectedProductCard";
import type { ProductGroup } from "../../../lib/helpers/productCategoryDetector";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";
import type { StampProductSectionT } from "../../../lib/types/productSectionTypes";

/**
 * ProductGrid
 *
 * Product side of step 5 and its loading/error/empty states. Opens with a
 * category selector (apparel or accessories, like the catalog toolbar) and
 * shows the products of the chosen group. Once a product is picked, only
 * that product is shown, in its expanded card.
 */

interface PropsI {
  sections: StampProductSectionT[];
  selectedProduct: CatalogProductMappedType | undefined;
  isLoading: boolean;
  isError: boolean;
  onProductSelect: (product: CatalogProductMappedType) => void;
  onClearSelection: () => void;
}

export function ProductGrid({
  sections,
  selectedProduct,
  isLoading,
  isError,
  onProductSelect,
  onClearSelection,
}: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const [group, setGroup] = useState<ProductGroup | undefined>(undefined);
  // Fall back to the first group until one is picked, or when the picked
  // group has no products after a catalog refresh.
  const activeSection =
    sections.find((section) => section.group === group) ?? sections[0];

  return (
    <div className="flex-1 md:h-full min-h-0 overflow-y-auto overflow-x-hidden bg-(--color-stamp-cream)/20 pb-40 md:pb-0">
      {isLoading && (
        <div
          className="h-full w-full flex items-center justify-center"
          aria-busy="true"
          aria-label={t("loadingAria")}
        >
          <div className="grid w-full grid-cols-2 gap-3 p-8 lg:p-10">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="aspect-square bg-(--color-stamp-divider)/20 animate-pulse"
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
          <Span variant="micro" className="text-(--color-stamp-error) mb-2">
            {t("loadError")}
          </Span>
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("loadErrorHint")}
          </Paragraph>
        </div>
      )}

      {!isLoading && !isError && !activeSection && (
        <div
          role="status"
          className="h-full w-full flex items-center justify-center p-12 text-center"
        >
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("empty")}
          </Span>
        </div>
      )}

      {!isLoading && !isError && activeSection && selectedProduct && (
        <div className="flex h-full w-full flex-col justify-center p-4 lg:p-6">
          <SelectedProductCard
            product={selectedProduct}
            onClearSelection={onClearSelection}
          />
        </div>
      )}

      {!isLoading && !isError && activeSection && !selectedProduct && (
        <>
          <ProductGroupToolbar
            sections={sections}
            group={activeSection.group}
            onGroupChange={setGroup}
          />

          <div className="grid grid-cols-2 gap-3 p-4 lg:gap-4 lg:p-6 xl:grid-cols-3">
            {activeSection.products.map((product) => (
              <ProductCard
                key={product.blueprintId}
                product={product}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
