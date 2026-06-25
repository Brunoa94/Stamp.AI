/**
 * Product Spec Card Component
 * Displays a product option in the stamp creation flow
 */

import { memo, useCallback } from "react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import type { StampCatalogProduct } from "../../lib/types/catalogProduct";
import { PRODUCT_FALLBACK_IMAGE } from "../../lib/constants/productSpec";

interface ProductSpecCardProps {
  product: StampCatalogProduct;
  isSelected: boolean;
  onSelect: (product: StampCatalogProduct) => void;
  disabled?: boolean;
}

export const ProductSpecCard = memo(function ProductSpecCard({
  product,
  isSelected,
  onSelect,
  disabled,
}: ProductSpecCardProps) {
  const handleClick = useCallback(() => {
    onSelect(product);
  }, [product, onSelect]);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "border-2 rounded-none p-3 space-y-2 text-left transition-all duration-300 flex flex-col h-auto",
        "hover:shadow-xl hover:scale-[1.02]",
        disabled && "opacity-60 cursor-not-allowed hover:scale-100",
        isSelected
          ? "border-brandCyan bg-brandCyan/10 shadow-xl"
          : "border-ink/20 hover:border-brandCyan",
      )}
    >
      {/* Product Image */}
      <div className="relative w-full h-32 bg-paper/50">
        <img
          src={product.image || PRODUCT_FALLBACK_IMAGE}
          alt={product.fabricType}
          className="object-contain w-full h-full"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
          }}
        />

        {/* Stock status badge */}
        {product.availabilityStatus === "out_of_stock" && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-[7px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            OUT OF STOCK
          </div>
        )}
        {product.availabilityStatus === "discontinued" && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 text-[7px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            DISCONTINUED
          </div>
        )}
        {product.availabilityStatus === "temporarily_unavailable" && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 text-[7px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            TEMP UNAVAILABLE
          </div>
        )}
      </div>

      {/* Product Title */}
      <h3 className="font-anton text-sm tracking-wider uppercase text-ink">
        {product.fabricType}
      </h3>

      {/* Price */}
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-ink text-white">
        <span className="font-anton text-xs">
          {product.price > 0 ? `$${product.price.toFixed(2)}` : "Loading..."}
        </span>
      </div>
    </Button>
  );
});
