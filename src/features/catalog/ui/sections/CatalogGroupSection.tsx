"use client";

import { useTranslations } from "next-intl";
import { HomeSectionHeader } from "@/features/homepage/ui/components/HomeSectionHeader";
import type { CatalogGroupSectionType } from "../../lib/types/catalogPageTypes";
import { CatalogProductCard } from "../components/CatalogProductCard";

/**
 * CatalogGroupSection
 *
 * One product group of the catalog (clothing or accessories): the shared
 * section header (accent bar, title, one-line subtitle) over the product
 * card grid. Keeps a deep-linkable anchor id, with a scroll margin
 * clearing the fixed h-24 header.
 */

interface PropsI {
  section: CatalogGroupSectionType;
}

export function CatalogGroupSection({ section }: PropsI) {
  const t = useTranslations("catalog");
  const groupLabel = t(`groups.${section.group}`);

  return (
    <section
      id={`group-${section.group}`}
      aria-label={groupLabel}
      className="scroll-mt-32"
    >
      <HomeSectionHeader
        title={groupLabel}
        subtitle={t("section.subtitle", { group: groupLabel })}
        className="mb-10"
      />

      <div className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {section.products.map((product) => (
          <CatalogProductCard key={product.blueprintId} product={product} />
        ))}
      </div>
    </section>
  );
}
