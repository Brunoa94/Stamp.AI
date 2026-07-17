"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { ProductCard } from "./ProductCard";
import { SelectedProductCard } from "./SelectedProductCard";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductGrid
 *
 * Manages the grid layout of products and handles loading/error/empty states.
 * Products are grouped into clothing (apparel) and accessories with a visual separator.
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
  const allProducts = [...clothingProducts, ...accessoryProducts];
  const hasProducts = allProducts.length > 0;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-(--color-stamp-cream)/20">
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
            <>
              {/* Clothing Section */}
              {clothingProducts.length > 0 && (
                <div>
                  <Span
                    variant="micro"
                    className="text-(--color-stamp-taupe) uppercase tracking-widest mb-4 block"
                  >
                    {t("apparel")}
                  </Span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              )}

              {/* Visual Separator */}
              {clothingProducts.length > 0 && accessoryProducts.length > 0 && (
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-(--color-stamp-divider)" />
                  <Span
                    variant="micro"
                    className="text-(--color-stamp-taupe)/60 uppercase tracking-widest"
                  >
                    {t("moreOptions")}
                  </Span>
                  <div className="flex-1 h-px bg-(--color-stamp-divider)" />
                </div>
              )}

              {/* Accessories Section */}
              {accessoryProducts.length > 0 && (
                <div>
                  <Span
                    variant="micro"
                    className="text-(--color-stamp-taupe) uppercase tracking-widest mb-4 block"
                  >
                    {t("accessories")}
                  </Span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
