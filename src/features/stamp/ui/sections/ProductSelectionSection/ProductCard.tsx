
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductCard
 *
 * Displays a single product option in the catalog grid.
 * Handles hover effects and selection state.
 */

interface PropsI {
  product: CatalogProductMappedType;
  isSelected: boolean;
  onSelect: (product: CatalogProductMappedType) => void;
}

export function ProductCard({ product, isSelected, onSelect }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(product)}
      className={`group relative overflow-hidden rounded-none whitespace-normal h-auto p-0 flex flex-col items-center text-center border-(--color-stamp-divider) hover:bg-(--color-stamp-gold)/5 transition-all duration-300 ${
        isSelected
          ? "border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5"
          : "border bg-white"
      }`}
      aria-pressed={isSelected}
      aria-label={t("selectAria", { name: product.name })}
    >
      {/* Image container - fills most of the card */}
      <div className="relative w-full aspect-square overflow-hidden bg-(--color-stamp-cream)/30">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-(--color-stamp-cream)" />
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <CheckCircle className="text-(--color-stamp-gold) w-6 h-6" />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="w-full p-4 bg-white">
        <Heading
          as="h4"
          variant="item"
          className="text-(--color-stamp-chocolate) mb-1 text-center leading-tight min-h-10 overflow-hidden line-clamp-2 flex items-center justify-center text-sm md:text-base w-full"
        >
          {product.name}
        </Heading>

        <Span
          variant="sm"
          className="text-(--color-stamp-taupe)"
        >
          €{product.price.toFixed(2)}
        </Span>
      </div>
    </Button>
  );
}
