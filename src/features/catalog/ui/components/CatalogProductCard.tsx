"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { ColorSwatches } from "@/features/homepage/ui/components/ColorSwatches";
import type { CatalogDisplayProductType } from "../../lib/types/catalogPageTypes";
import { CatalogProductDialog } from "./CatalogProductDialog";

/**
 * CatalogProductCard
 *
 * Catalog grid card mirroring the homepage product card treatment
 * (framed image, grayscale-to-color hover, swatches, discount badge),
 * but acting as a button that opens the quick-view dialog. Hovering
 * swaps to the second gallery photo and reveals a quick-view bar.
 * Raw <button> by design: the Button atom only ships CTA variants and
 * a card-sized trigger needs block layout and left-aligned text.
 */

interface PropsI {
  product: CatalogDisplayProductType;
}

export function CatalogProductCard({ product }: PropsI) {
  const t = useTranslations("catalog.card");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const coverImageUrl = product.imageUrls[0];
  const hoverImageUrl = product.imageUrls[1];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        aria-label={t("quickViewAria", { name: product.name })}
        className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-stamp-gold)"
      >
        <div className="relative mb-3 sm:mb-5 aspect-square sm:aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all duration-500 group-hover:-translate-y-1 group-hover:border-(--color-stamp-gold) group-hover:shadow-(--shadow-stamp-card-hover)">
          {coverImageUrl ? (
            <>
              <Image
                src={coverImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
              />
              {hoverImageUrl && (
                <Image
                  src={hoverImageUrl}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {t("noImage")}
              </Span>
            </div>
          )}

          {product.imageUrls.length > 1 && (
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 border border-(--color-stamp-divider) bg-(--color-stamp-off-white)/90 px-1.5 py-1 sm:px-2.5 sm:py-1.5 backdrop-blur-sm">
              <Span variant="micro" className="text-(--color-stamp-chocolate)">
                {t("photoCount", { count: product.imageUrls.length })}
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
              <Span
                variant="micro"
                className="font-medium text-(--color-stamp-white)"
              >
                {t("discountBadge", { percent: product.discountPercent })}
              </Span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-(--color-stamp-chocolate)/90 py-2.5 text-center backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:block">
            <Span variant="micro" className="text-(--color-stamp-white)">
              {t("quickView")}
            </Span>
          </div>
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
      </button>

      <CatalogProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
