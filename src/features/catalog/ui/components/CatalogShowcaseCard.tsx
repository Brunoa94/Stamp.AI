"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { CatalogShowcaseItemType } from "../../lib/types/catalogPageTypes";

/**
 * CatalogShowcaseCard
 *
 * One group card of the showcase row, in the shared "stamp frame": a
 * white rounded card with the product photo on top and the group label
 * underneath. Lifts into the offset stamp shadow on hover. Selecting it narrows the
 * catalog to that group. Uses Button variant="unstyled" for card-style
 * trigger with block layout.
 */

interface PropsI {
  item: CatalogShowcaseItemType;
  onSelect: () => void;
}

export function CatalogShowcaseCard({ item, onSelect }: PropsI) {
  const t = useTranslations("catalog");
  const label = t(`groups.${item.group}`);

  return (
    <Button
      type="button"
      variant="unstyled"
      onClick={onSelect}
      aria-label={t("showcase.cardAria", { group: label })}
      className="group block w-full rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 text-center shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-(--color-stamp-cream) sm:aspect-5/2">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={label}
            fill
            sizes="50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("card.noImage")}
            </Span>
          </div>
        )}
      </div>

      <div className="px-2 pt-3 pb-1 sm:pt-4 sm:pb-2">
        <Span
          variant="label"
          className="text-(--color-stamp-chocolate) group-hover:text-(--color-stamp-gold-text)"
        >
          {label}
        </Span>
      </div>
    </Button>
  );
}
