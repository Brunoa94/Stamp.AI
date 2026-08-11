/**
 * HomeProductCard
 *
 * Showcase product card: full-bleed 3:4 image with a chocolate gradient
 * overlay carrying the product name, price and color swatches, plus a
 * discount badge. Slides in from the right when first scrolled into view.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Heading } from "@/features/ui/heading";
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
      className="group relative block aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover)"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(100px)",
        transition: `opacity 0.6s ease-out ${staggerDelay}ms, transform 0.6s ease-out ${staggerDelay}ms`,
      }}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("noImage")}
          </Span>
        </div>
      )}

      {/* Gradient scrim so the overlaid name and price stay readable */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-(--color-stamp-chocolate)/75 via-(--color-stamp-chocolate)/10 to-transparent"
      />

      {product.discountPercent && product.discountPercent > 0 && (
        <div className="absolute right-3 top-3 bg-(--color-stamp-gold) px-2.5 py-1 sm:right-4 sm:top-4">
          <Span
            variant="micro"
            className="font-medium text-(--color-stamp-white)"
          >
            {t("discountBadge", { percent: product.discountPercent })}
          </Span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 sm:gap-3 sm:p-6">
        {product.availableColors.length > 0 && (
          <ColorSwatches colors={product.availableColors} maxDisplay={4} />
        )}

        <div className="flex items-end justify-between gap-2 sm:gap-4">
          <Heading
            as="h3"
            variant="item"
            className="text-sm text-(--color-stamp-off-white) sm:text-base md:text-lg"
          >
            {product.name}
          </Heading>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            {product.isOnSale && product.originalPrice && (
              <Span
                variant="micro"
                className="text-[10px] text-(--color-stamp-off-white)/60 line-through sm:text-xs"
              >
                €{product.originalPrice.toFixed(2)}
              </Span>
            )}
            <Span
              variant="sm"
              className={`text-xs sm:text-sm ${
                product.isOnSale
                  ? "text-(--color-stamp-gold)"
                  : "text-(--color-stamp-off-white)"
              }`}
            >
              €{product.price.toFixed(2)}
            </Span>
          </div>
        </div>

        <span className="flex items-center gap-2 text-(--color-stamp-off-white)/0 transition-all duration-300 group-hover:text-(--color-stamp-off-white)">
          <Span variant="micro" className="uppercase tracking-widest">
            {t("shopNow")}
          </Span>
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
