"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import { ColorSwatches } from "@/features/homepage/ui/components/ColorSwatches";
import type { CatalogDisplayProductType } from "../../lib/types/catalogPageTypes";
import { CatalogProductGallery } from "./CatalogProductGallery";
import { CatalogProductReviews } from "./CatalogProductReviews";

/**
 * CatalogProductDialog
 *
 * Quick-view dialog for a catalog product: Printify photo gallery,
 * SEO description and specs, price, available colors, the reviews
 * placeholder, and a CTA into the design studio.
 */

interface PropsI {
  product: CatalogDisplayProductType;
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogProductDialog({ product, isOpen, onClose }: PropsI) {
  const t = useTranslations("catalog.dialog");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none border border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-6 sm:max-w-3xl md:p-8">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal uppercase tracking-tight text-(--color-stamp-chocolate)">
            {product.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {product.description ?? product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 sm:grid-cols-2">
          <CatalogProductGallery
            name={product.name}
            imageUrls={product.imageUrls}
          />

          <div className="flex flex-col gap-6">
            <div className="flex items-baseline gap-3">
              {product.isOnSale && product.originalPrice && (
                <Span
                  variant="micro"
                  className="text-(--color-stamp-taupe) line-through"
                >
                  €{product.originalPrice.toFixed(2)}
                </Span>
              )}
              <Span
                variant="value"
                className={
                  product.isOnSale
                    ? "text-(--color-stamp-gold)"
                    : "text-(--color-stamp-chocolate)"
                }
              >
                €{product.price.toFixed(2)}
              </Span>
            </div>

            {product.availableColors.length > 0 && (
              <div className="space-y-2">
                <Span
                  as="div"
                  variant="micro"
                  className="text-(--color-stamp-taupe)"
                >
                  {t("colorsLabel")}
                </Span>
                <ColorSwatches colors={product.availableColors} />
              </div>
            )}

            {product.specs.length > 0 && (
              <div className="space-y-2">
                <Span
                  as="div"
                  variant="micro"
                  className="text-(--color-stamp-taupe)"
                >
                  {t("specsLabel")}
                </Span>
                <List className="list-disc space-y-1.5 pl-4 font-body text-sm leading-relaxed text-(--color-stamp-chocolate)/80">
                  {product.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </List>
              </div>
            )}

            <CatalogProductReviews />

            <Button asChild variant="primary-compact" className="mt-auto">
              <Link href="/stamp">{t("customizeCta")}</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
