/**
 * HomeProductCard
 *
 * Catalog product card: framed 3:4 image with grayscale-to-color hover,
 * color swatches, availability badge, name and price.
 * Slides in from right to left when first scrolled into view.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { ColorSwatches } from "./ColorSwatches";
import type { ProductCardData } from "../../lib/mappers/productCardMapper";

interface HomeProductCardPropsI {
  product: ProductCardData;
  index: number;
}

export function HomeProductCard({ product, index }: HomeProductCardPropsI) {
  const t = useTranslations("home.productCard");
  const { ref, isVisible } = useIntersectionObserver<HTMLAnchorElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Stagger delay: each card animates 100ms after the previous
  const staggerDelay = index * 100;

  return (
    <Link
      ref={ref}
      href={product.href}
      className="group block"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(100px)",
        transition: `opacity 0.6s ease-out ${staggerDelay}ms, transform 0.6s ease-out ${staggerDelay}ms`,
      }}
    >
      <div className="relative mb-3 sm:mb-5 aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all duration-500 group-hover:-translate-y-1 group-hover:border-(--color-stamp-gold) group-hover:shadow-(--shadow-stamp-card-hover)">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("noImage")}
            </Span>
          </div>
        )}

        {product.availableColors.length > 0 && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 border border-(--color-stamp-divider) bg-(--color-stamp-off-white)/90 px-1.5 py-1 sm:px-2.5 sm:py-2 backdrop-blur-sm">
            <ColorSwatches colors={product.availableColors} maxDisplay={4} />
          </div>
        )}

        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-(--color-stamp-gold) px-1.5 py-0.5 sm:px-2.5 sm:py-1">
            <Span variant="micro" className="font-medium text-(--color-stamp-white)">
              {t("discountBadge", { percent: product.discountPercent })}
            </Span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <Heading
          as="h3"
          variant="item"
          className="text-xs sm:text-sm text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-gold)"
        >
          {product.name}
        </Heading>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {product.isOnSale && product.originalPrice && (
            <Span
              variant="micro"
              className="text-(--color-stamp-taupe) line-through text-[10px] sm:text-xs"
            >
              €{product.originalPrice.toFixed(2)}
            </Span>
          )}
          <Span
            variant="sm"
            className={`text-xs sm:text-sm ${
              product.isOnSale
                ? "text-(--color-stamp-gold)"
                : "text-(--color-stamp-chocolate)"
            }`}
          >
            €{product.price.toFixed(2)}
          </Span>
        </div>
      </div>

      {product.description && (
        <Paragraph
          variant="xs"
          className="mt-1.5 line-clamp-2 text-(--color-stamp-taupe)"
        >
          {product.description}
        </Paragraph>
      )}
    </Link>
  );
}
