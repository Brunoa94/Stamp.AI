"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import type { CatalogGroupSectionType } from "../../lib/types/catalogPageTypes";
import { CatalogProductCard } from "../components/CatalogProductCard";

/**
 * CatalogGroupSection
 *
 * One product group of the catalog (clothing or accessories),
 * marketplace-style: heading with a one-line subtitle, and the product
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
      <div className="mb-8">
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

      <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-12">
        {section.products.map((product) => (
          <CatalogProductCard key={product.blueprintId} product={product} />
        ))}
      </div>
    </section>
  );
}
