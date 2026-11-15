
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductCard
 *
 * Displays a single product option in the catalog grid.
 * Picking it selects the product; the selected product is shown by
 * SelectedProductCard instead.
 */

interface PropsI {
  product: CatalogProductMappedType;
  onSelect: (product: CatalogProductMappedType) => void;
}

export function ProductCard({ product, onSelect }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(product)}
      className="group relative overflow-hidden rounded-none whitespace-normal h-auto p-0 flex flex-col items-center text-center border border-(--color-stamp-divider) bg-white hover:border-(--color-stamp-gold) hover:bg-(--color-stamp-gold)/5 transition-all duration-300"
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
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 17vw"
          />
        ) : (
          <div className="w-full h-full bg-(--color-stamp-cream)" />
        )}
      </div>

      {/* Text content */}
      <div className="w-full p-4 bg-white">
        <Heading
          as="h3"
          variant="item"
          className="text-(--color-stamp-chocolate) mb-1 text-center leading-tight min-h-10 overflow-hidden line-clamp-2 flex items-center justify-center text-base md:text-lg w-full"
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
