"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { CatalogShowcaseItemType } from "../../lib/types/catalogPageTypes";

/**
 * CatalogShowcaseCard
 *
 * One group card of the showcase row: a product photo on top and a
 * label strip underneath, marketplace-style. Selecting it narrows the
 * catalog to that group. Raw <button> by design: the Button atom only
 * ships CTA variants and the card needs block layout.
 */

interface PropsI {
  item: CatalogShowcaseItemType;
  onSelect: () => void;
}

export function CatalogShowcaseCard({ item, onSelect }: PropsI) {
  const t = useTranslations("catalog");
  const label = t(`groups.${item.group}`);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t("showcase.cardAria", { group: label })}
      className="group block w-full overflow-hidden rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) text-center transition-all duration-300 hover:-translate-y-1 hover:border-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
    >
      <div className="relative aspect-square sm:aspect-[5/2] bg-(--color-stamp-white)">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={label}
            fill
            sizes="50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("card.noImage")}
            </Span>
          </div>
        )}
      </div>

      <div className="border-t border-(--color-stamp-divider) bg-(--color-stamp-off-white) px-2 py-3 sm:px-3 sm:py-5">
        <Span variant="label" className="text-(--color-stamp-chocolate)">
          {label}
        </Span>
      </div>
    </button>
  );
}
