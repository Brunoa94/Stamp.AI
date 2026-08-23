"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

/**
 * CatalogProductReviews
 *
 * Reviews slot in the product quick-view dialog. Reviews have no data
 * layer yet, so this renders a labelled coming-soon placeholder; once
 * reviews exist it will take the product's blueprintId and render them.
 */

export function CatalogProductReviews() {
  const t = useTranslations("catalog.reviews");

  return (
    <div className="space-y-2">
      <Span as="div" variant="micro" className="text-(--color-stamp-taupe)">
        {t("label")}
      </Span>
      <div
        role="status"
        className="border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-4"
      >
        <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
          {t("comingSoon")}
        </Paragraph>
      </div>
    </div>
  );
}
