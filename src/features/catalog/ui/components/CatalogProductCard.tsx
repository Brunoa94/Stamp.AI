"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { ColorSwatches } from "@/features/homepage/ui/components/ColorSwatches";
import type { CatalogDisplayProductT } from "../../lib/types/catalogPageTypes";
import { CatalogProductDialog } from "./CatalogProductDialog";

/**
 * CatalogProductCard
 *
 * Catalog grid card in the shared "stamp frame", matching the homepage
 * product card: a white rounded card with a square photo, an amber sale
 * badge, the product name, the price (with the old price when on sale),
 * a short description and the colours it comes in. It is a button that
 * opens the quick-view dialog: hovering swaps to the second gallery photo,
 * reveals a quick-view bar and lifts the card into the offset stamp shadow.
 * Uses Button variant="unstyled" for a card-sized trigger with block
 * layout and left-aligned text.
 */

interface PropsI {
  product: CatalogDisplayProductT;
}

export function CatalogProductCard({ product }: PropsI) {
  const t = useTranslations("catalog.card");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const coverImageUrl = product.imageUrls[0];
  const hoverImageUrl = product.imageUrls[1];

  return (
    <>
      <Button
        type="button"
        variant="unstyled"
        onClick={() => setIsDialogOpen(true)}
        aria-label={t("quickViewAria", { name: product.displayName })}
        className="group flex h-full w-full flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 pb-4 text-left shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
      >
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-(--color-stamp-cream)">
          {coverImageUrl ? (
            <>
              <Image
                src={coverImageUrl}
                alt={product.displayName}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {hoverImageUrl && (
                <Image
                  src={hoverImageUrl}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {t("noImage")}
              </Span>
            </div>
          )}

          {(product.discountPercent ?? 0) > 0 && (
            <Span
              variant="badge"
              className="absolute top-2 left-2 rounded-md bg-(--color-stamp-gold) px-2 py-1 text-(--color-stamp-chocolate)"
            >
              {t("discountBadge", { percent: product.discountPercent ?? 0 })}
            </Span>
          )}

          {product.imageUrls.length > 1 && (
            <Span
              variant="micro"
              className="absolute top-2 right-2 rounded-md bg-(--color-stamp-white)/90 px-2 py-1 text-(--color-stamp-chocolate) backdrop-blur-sm"
            >
              {t("photoCount", { count: product.imageUrls.length })}
            </Span>
          )}

          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-(--color-stamp-chocolate)/90 py-2.5 text-center backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:block">
            <Span variant="badge" className="text-(--color-stamp-white)">
              {t("quickView")}
            </Span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2">
          <Heading
            as="h3"
            variant="itemCompact"
            className="line-clamp-2 text-base text-(--color-stamp-chocolate) group-hover:text-(--color-stamp-gold-text) md:text-base"
          >
            {product.displayName}
          </Heading>

          <div className="flex items-baseline gap-2">
            <Span
              unstyled
              className={cn(
                "text-lg font-bold",
                product.isOnSale ? "text-(--color-stamp-gold-text)" : "text-(--color-stamp-chocolate)",
              )}
            >
              €{product.price.toFixed(2)}
            </Span>
            {product.isOnSale && product.originalPrice && (
              <Span variant="micro" className="text-(--color-stamp-taupe) line-through">
                €{product.originalPrice.toFixed(2)}
              </Span>
            )}
          </div>

          <Paragraph variant="xs" className="line-clamp-2 text-sm text-(--color-stamp-taupe)">
            {product.description || "\u00A0"}
          </Paragraph>

          {product.availableColors.length > 0 && (
            <div className="mt-auto pt-2">
              <ColorSwatches colors={product.availableColors} labels={product.colorLabels} maxDisplay={5} />
            </div>
          )}
        </div>
      </Button>

      <CatalogProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
