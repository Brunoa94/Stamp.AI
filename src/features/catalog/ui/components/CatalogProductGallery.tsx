"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { SharedElementTransition } from "@/shared/ui/SharedElementTransition";
import { CATALOG_PRODUCT_MORPH } from "../../lib/constants/catalogViewTransitions";

/**
 * CatalogProductGallery
 *
 * All Printify product photos: a framed main image plus a thumbnail
 * strip to switch between them. Falls back to a no-image placeholder
 * when the product has no synced photos. The main image shares a view
 * transition name with the product card cover so it morphs in and out.
 */

interface PropsI {
  name: string;
  imageUrls: string[];
  transitionName: string;
}

export function CatalogProductGallery({
  name,
  imageUrls,
  transitionName,
}: PropsI) {
  const t = useTranslations("catalog.dialog");
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (imageUrls.length === 0) {
    return (
      <div
        role="status"
        className="flex aspect-square items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)"
      >
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("noImage")}
        </Span>
      </div>
    );
  }

  const selectedImageUrl = imageUrls[selectedIndex] ?? imageUrls[0];

  return (
    <div className="space-y-3" aria-label={t("photosLabel")}>
      <div className="relative aspect-square overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white)">
        <SharedElementTransition
          name={transitionName}
          share={CATALOG_PRODUCT_MORPH}
        >
          <Image
            src={selectedImageUrl}
            alt={t("photoAlt", {
              name,
              number: selectedIndex + 1,
              total: imageUrls.length,
            })}
            fill
            sizes="(max-width: 640px) 90vw, 40vw"
            className="object-cover"
          />
        </SharedElementTransition>
      </div>

      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((imageUrl, index) => (
            <Button
              key={imageUrl}
              variant="stamp-thumbnail"
              aria-pressed={index === selectedIndex}
              aria-label={t("thumbnailAria", { number: index + 1 })}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
