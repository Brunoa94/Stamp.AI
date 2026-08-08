
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Disclosure } from "../../components/Disclosure/Disclosure";
import { ProductCard } from "./ProductCard";
import { SelectedProductCard } from "./SelectedProductCard";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductGrid
 *
 * Manages the grid layout of products and handles loading/error/empty states.
 * Products are grouped into clothing (apparel) and accessories, each behind a
 * collapsible group header so the section fits the viewport; apparel starts
 * open on md+ where the grid has its own column.
 */

interface PropsI {
  clothingProducts: CatalogProductMappedType[];
  accessoryProducts: CatalogProductMappedType[];
  selectedProduct: CatalogProductMappedType | undefined;
  isLoading: boolean;
  isError: boolean;
  onProductSelect: (product: CatalogProductMappedType) => void;
  onClearSelection: () => void;
  isProductSelected: (product: CatalogProductMappedType) => boolean;
}

function ProductCardItem({
  product,
  isProductSelected,
  onClearSelection,
  onProductSelect,
}: {
  product: CatalogProductMappedType;
  isProductSelected: (product: CatalogProductMappedType) => boolean;
  onClearSelection: () => void;
  onProductSelect: (product: CatalogProductMappedType) => void;
}) {
  const selected = isProductSelected(product);

  if (selected) {
    return (
      <SelectedProductCard
        key={product.blueprintId}
        product={product}
        onClearSelection={onClearSelection}
      />
    );
  }

  return (
    <ProductCard
      key={product.blueprintId}
      product={product}
      isSelected={selected}
      onSelect={onProductSelect}
    />
  );
}

export function ProductGrid({
  clothingProducts,
  accessoryProducts,
  selectedProduct,
  isLoading,
  isError,
  onProductSelect,
  onClearSelection,
  isProductSelected,
}: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const isMdUp = useMediaQuery("(min-width: 768px)", true);
  const allProducts = [...clothingProducts, ...accessoryProducts];
  const hasProducts = allProducts.length > 0;

  return (
    <div className="flex-1 md:flex-none md:h-full min-h-0 overflow-y-auto bg-(--color-stamp-cream)/20">
      {isLoading && (
        <div
          className="h-full flex items-center justify-center"
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
          className="h-full flex flex-col items-center justify-center p-12 text-center"
        >
          <Span variant="micro" className="text-red-500 mb-2">
            {t("loadError")}
          </Span>
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("loadErrorHint")}
          </Paragraph>
        </div>
      )}

      {!isLoading && !isError && !hasProducts && (
        <div
          role="status"
          className="h-full flex items-center justify-center p-12 text-center"
        >
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("empty")}
          </Span>
        </div>
      )}

      {!isLoading && !isError && hasProducts && (
        <div className="p-4 lg:p-6">
          {/* When a product is selected, show only that product */}
          {selectedProduct ? (
            <div className="grid grid-cols-1 gap-4">
              <ProductCardItem
                product={selectedProduct}
                isProductSelected={isProductSelected}
                onClearSelection={onClearSelection}
                onProductSelect={onProductSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clothing Section */}
              {clothingProducts.length > 0 && (
                <Disclosure
                  key={`apparel-${isMdUp}`}
                  label={t("apparel")}
                  value={String(clothingProducts.length)}
                  defaultOpen={isMdUp}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {clothingProducts.map((product) => (
                      <ProductCardItem
                        key={product.blueprintId}
                        product={product}
                        isProductSelected={isProductSelected}
                        onClearSelection={onClearSelection}
                        onProductSelect={onProductSelect}
                      />
                    ))}
                  </div>
                </Disclosure>
              )}

              {/* Accessories Section */}
              {accessoryProducts.length > 0 && (
                <Disclosure
                  label={t("accessories")}
                  value={String(accessoryProducts.length)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {accessoryProducts.map((product) => (
                      <ProductCardItem
                        key={product.blueprintId}
                        product={product}
                        isProductSelected={isProductSelected}
                        onClearSelection={onClearSelection}
                        onProductSelect={onProductSelect}
                      />
                    ))}
                  </div>
                </Disclosure>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
