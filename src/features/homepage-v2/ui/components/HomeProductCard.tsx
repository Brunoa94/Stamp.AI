/**
 * HomeProductCard
 *
 * Catalog product card: framed 3:4 image with grayscale-to-color hover,
 * color swatches, availability badge, name and price.
 */

import Image from "next/image";
import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { ColorSwatches } from "@/features/homepage-brutalist/ui/components/ColorSwatches";
import type { ProductCardData } from "@/features/homepage-brutalist/lib/mappers/productCardMapper";

const AVAILABILITY_BADGES: Record<string, string> = {
  out_of_stock: "Out of stock",
  discontinued: "Discontinued",
  temporarily_unavailable: "Temp unavailable",
};

interface HomeProductCardPropsI {
  product: ProductCardData;
}

export function HomeProductCard({ product }: HomeProductCardPropsI) {
  const badge = product.availabilityStatus
    ? AVAILABILITY_BADGES[product.availabilityStatus]
    : undefined;

  return (
    <Link href={product.href} className="group block">
      <div className="relative mb-5 aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all duration-500 group-hover:-translate-y-1 group-hover:border-(--color-stamp-gold) group-hover:shadow-(--shadow-stamp-card-hover)">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              No image
            </Span>
          </div>
        )}

        {product.availableColors.length > 0 && (
          <div className="absolute bottom-4 left-4 border border-(--color-stamp-divider) bg-(--color-stamp-off-white)/90 px-2.5 py-2 backdrop-blur-sm">
            <ColorSwatches colors={product.availableColors} maxDisplay={5} />
          </div>
        )}

        {badge && (
          <Span
            variant="micro"
            className="absolute right-4 top-4 bg-(--color-stamp-error)/90 px-3 py-1.5 text-(--color-stamp-white)"
          >
            {badge}
          </Span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <Heading
          as="h3"
          variant="item"
          className="text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-gold)"
        >
          {product.name}
        </Heading>
        <div className="flex flex-col items-end gap-0.5">
          {product.isOnSale && product.originalPrice && (
            <Span
              variant="micro"
              className="text-(--color-stamp-taupe) line-through"
            >
              €{product.originalPrice.toFixed(2)}
            </Span>
          )}
          <Span
            variant="sm"
            className={
              product.isOnSale
                ? "text-(--color-stamp-gold)"
                : "text-(--color-stamp-chocolate)"
            }
          >
            €{product.price.toFixed(2)}
          </Span>
        </div>
      </div>
    </Link>
  );
}
