/**
 * FeaturedCarouselCard
 *
 * Individual product card for the featured carousel with vintage frame styling.
 * Slides in from right to left when first scrolled into view.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { CarouselProductData } from "../../../lib/types/carousel";

interface FeaturedCarouselCardProps {
  product: CarouselProductData;
  index: number;
}

export function FeaturedCarouselCard({
  product,
  index,
}: FeaturedCarouselCardProps) {
  const t = useTranslations("home.featured");
  const prefersReducedMotion = useReducedMotion();
  const { ref, isVisible } = useIntersectionObserver<HTMLAnchorElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Stagger delay: each card animates 100ms after the previous
  const staggerDelay = index * 100;

  // When reduced motion is preferred, skip animations entirely
  const animationStyle = prefersReducedMotion
    ? { opacity: 1 }
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(100px)",
        transition: `opacity 0.6s ease-out ${staggerDelay}ms, transform 0.6s ease-out ${staggerDelay}ms`,
      };

  return (
    <Link
      ref={ref}
      href={product.href}
      className="group block w-72 shrink-0 sm:w-80"
      style={animationStyle}
    >
      <div className="relative border-2 border-(--color-stamp-divider) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) p-3 shadow-[inset_0_0_0_1px_var(--color-stamp-taupe)/20,0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-1">
        <div className="pointer-events-none absolute inset-2 border border-(--color-stamp-taupe)/30" />

        <div className="relative aspect-3/4 overflow-hidden bg-(--color-stamp-white)">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 288px, 320px"
              className="object-cover sepia-[0.1] transition-all duration-700 group-hover:scale-105 group-hover:sepia-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {t("noImage")}
              </Span>
            </div>
          )}

          <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center border border-(--color-stamp-taupe) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) shadow-sm backdrop-blur-sm">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {String(index + 1).padStart(2, "0")}
            </Span>
          </div>
        </div>

        <div className="mt-3 border-t border-(--color-stamp-divider)/50 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Heading
                as="h3"
                variant="item"
                className="truncate text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-gold)"
              >
                {product.name}
              </Heading>
              <Span
                as="p"
                variant="micro"
                className="mt-0.5 text-(--color-stamp-taupe)"
              >
                {t("collectionLabel")}
              </Span>
            </div>
            {product.price > 0 && (
              <Span
                variant="micro"
                className="shrink-0 font-medium text-(--color-stamp-chocolate)"
              >
                €{product.price.toFixed(2)}
              </Span>
            )}
          </div>
          {product.description && (
            <Paragraph
              variant="sm"
              className="mt-2 line-clamp-2 text-(--color-stamp-chocolate)/60"
            >
              {product.description}
            </Paragraph>
          )}
        </div>
      </div>
    </Link>
  );
}
