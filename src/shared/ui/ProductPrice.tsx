"use client";

import { Span } from "@/features/ui/span";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/formatPrice";

/** Prices in EUR cents; labels remain available to screen readers. */
export function ProductPrice({ priceCents, regularPriceCents, className = "" }: {
  priceCents: number;
  regularPriceCents?: number | null;
  className?: string;
}) {
  const t = useTranslations("promotions");
  const onSale = regularPriceCents != null && regularPriceCents > priceCents;
  return <Span unstyled className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
    {onSale && <del className="text-sm font-normal text-(--color-stamp-taupe)">
      <Span unstyled className="sr-only">{t("regularPrice")} </Span>{formatPrice(regularPriceCents)}
    </del>}
    <Span unstyled className={onSale ? "text-(--color-stamp-gold)" : undefined}>
      <Span unstyled className="sr-only">{t(onSale ? "promotionalPrice" : "currentPrice")} </Span>{formatPrice(priceCents)}
    </Span>
  </Span>;
}
