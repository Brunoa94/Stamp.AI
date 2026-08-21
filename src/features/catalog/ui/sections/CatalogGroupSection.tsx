"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { CATALOG_SECTION_PREVIEW_COUNT } from "../../lib/constants/catalogPreview";
import type { CatalogGroupSectionType } from "../../lib/types/catalogPageTypes";
import { CatalogProductCard } from "../components/CatalogProductCard";

/**
 * CatalogGroupSection
 *
 * One product group of the catalog (clothing or accessories),
 * marketplace-style: heading with a one-line subtitle, and the product
 * card grid. While previewing (browse-all mode) it shows only the
 * first row of products with a "See all" action that narrows the
 * catalog to the group. Keeps a deep-linkable anchor id, with a scroll
 * margin clearing the fixed h-24 header. "See all" is a raw <button>
 * by design: the Button atom only ships CTA variants and this is an
 * inline underlined text link.
 */

interface PropsI {
  section: CatalogGroupSectionType;
  isPreview?: boolean;
  onSeeAll?: () => void;
}

export function CatalogGroupSection({
  section,
  isPreview = false,
  onSeeAll,
}: PropsI) {
  const t = useTranslations("catalog");
  const groupLabel = t(`groups.${section.group}`);
  const products = isPreview
    ? section.products.slice(0, CATALOG_SECTION_PREVIEW_COUNT)
    : section.products;
  const hasSeeAll =
    isPreview &&
    onSeeAll !== undefined &&
    section.products.length > products.length;

  return (
    <section
      id={`group-${section.group}`}
      aria-label={groupLabel}
      className="scroll-mt-32"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Heading
            as="h2"
            variant="sectionSlab"
            className="text-(--color-stamp-chocolate)"
          >
            {groupLabel}
          </Heading>
          <Paragraph variant="xs" className="mt-2 text-(--color-stamp-taupe)">
            {t("section.subtitle", { group: groupLabel })}
          </Paragraph>
        </div>
        {hasSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            aria-label={t("section.seeAllAria", { group: groupLabel })}
            className="shrink-0 pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
          >
            <Span
              variant="micro"
              className="text-(--color-stamp-chocolate) underline underline-offset-4 transition-colors duration-300 hover:text-(--color-stamp-gold)"
            >
              {t("section.seeAll")}
            </Span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-12">
        {products.map((product) => (
          <CatalogProductCard key={product.blueprintId} product={product} />
        ))}
      </div>
    </section>
  );
}
