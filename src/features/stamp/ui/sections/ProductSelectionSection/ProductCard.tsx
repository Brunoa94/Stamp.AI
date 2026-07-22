
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
      className={`group relative overflow-hidden rounded-none whitespace-normal wrap-break-word aspect-square min-h-30 xl:min-h-80 p-6 lg:p-8 flex flex-col items-center text-center border-(--color-stamp-divider) hover:bg-(--color-stamp-gold)/5 transition-all duration-500 ${
        isSelected
          ? "border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5"
          : "border bg-white"
      }`}
      aria-pressed={isSelected}
      aria-label={t("selectAria", { name: product.name })}
    >
      <div className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-4 lg:pt-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pt-0">
        <div className="relative w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full group-hover:h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:object-cover group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 320px, 420px"
            />
          ) : (
            <div className="w-full h-full bg-(--color-stamp-cream)" />
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
      />

      {/* Opacity overlay between image and text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-linear-to-t from-white via-white/80 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-0"
      />

      <div className="absolute z-20 left-6 right-6 bottom-6 flex flex-col items-center">
        <Heading
          as="h4"
          variant="item"
          className="text-(--color-stamp-chocolate) mb-2 text-center leading-tight h-12 overflow-hidden line-clamp-2 flex items-center justify-center text-base md:text-lg w-full max-w-full wrap-break-word px-2 transition-opacity duration-500 group-hover:opacity-0"
        >
          {product.name}
        </Heading>

        <Span
          variant="sm"
          className="text-(--color-stamp-taupe) mb-4 transition-opacity duration-500 group-hover:opacity-0"
        >
          ${product.price.toFixed(2)}
        </Span>

        <div
          className={`transition-opacity duration-500 group-hover:opacity-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
        >
          <CheckCircle className="text-(--color-stamp-gold) w-5 h-5" />
        </div>
      </div>
    </Button>
  );
}
