"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { getCatalogShowcaseItems } from "../../lib/helpers/getCatalogShowcaseItems";
import type {
  CatalogGroupFilterType,
  CatalogGroupSectionType,
} from "../../lib/types/catalogPageTypes";
import { CatalogShowcaseCard } from "../components/CatalogShowcaseCard";

/**
 * CatalogShowcaseSection
 *
 * "Explore our best" row: the two product groups (clothing,
 * accessories) as photo cards, each narrowing the catalog to that
 * group, marketplace-style.
 */

interface PropsI {
  sections: CatalogGroupSectionType[];
  onGroupSelect: (group: CatalogGroupFilterType) => void;
}

export function CatalogShowcaseSection({ sections, onGroupSelect }: PropsI) {
  const t = useTranslations("catalog.showcase");
  const items = getCatalogShowcaseItems(sections);

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("title")}>
      <Heading
        as="h2"
        variant="sectionSlab"
        className="text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>
      <Paragraph variant="xs" className="mt-2 text-(--color-stamp-taupe)">
        {t("subtitle")}
      </Paragraph>

      <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:gap-6">
        {items.map((item) => (
          <CatalogShowcaseCard
            key={item.group}
            item={item}
            onSelect={() => onGroupSelect(item.group)}
          />
        ))}
      </div>
    </section>
  );
}
