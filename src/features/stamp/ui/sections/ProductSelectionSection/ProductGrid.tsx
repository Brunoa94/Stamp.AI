"use client";

import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { ProductCard } from "./ProductCard";
import { SelectedProductCard } from "./SelectedProductCard";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductGrid
 *
 * Manages the grid layout of products and handles loading/error/empty states.
 */

interface PropsI {
  products: CatalogProductMappedType[];
  selectedProduct: CatalogProductMappedType | undefined;
  isLoading: boolean;
  isError: boolean;
  onProductSelect: (product: CatalogProductMappedType) => void;
  onClearSelection: () => void;
  isProductSelected: (product: CatalogProductMappedType) => boolean;
}

export function ProductGrid({
  products,
  selectedProduct,
  isLoading,
  isError,
  onProductSelect,
  onClearSelection,
  isProductSelected,
}: PropsI) {
  const productsToRender = selectedProduct ? [selectedProduct] : products;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-(--color-stamp-cream)/20">
      {isLoading && (
        <div
          className="h-full flex items-center justify-center"
          aria-busy="true"
          aria-label="Loading products"
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
            Failed to load products
          </Span>
          <Paragraph className="text-(--color-stamp-taupe)">
            Please refresh the page and try again.
          </Paragraph>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div
          role="status"
          className="h-full flex items-center justify-center p-12 text-center"
        >
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            No products available at this time.
          </Span>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div
          className={`p-4 lg:p-6 grid grid-cols-1 gap-4 ${selectedProduct ? "" : "sm:grid-cols-2"}`}
        >
          {productsToRender.map((product) => {
            const selected = isProductSelected(product);

            if (selected) {
              return (
                <SelectedProductCard
                  key={product.id}
                  product={product}
                  onClearSelection={onClearSelection}
                />
              );
            }

            return (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selected}
                onSelect={onProductSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
