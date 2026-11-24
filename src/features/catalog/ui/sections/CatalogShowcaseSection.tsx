"use client";

import { useTranslations } from "next-intl";
import { HomeSectionHeader } from "@/features/homepage/ui/components/HomeSectionHeader";
import { getCatalogShowcaseItems } from "../../lib/helpers/getCatalogShowcaseItems";
import type {
  CatalogGroupFilterType,
  CatalogGroupSectionType,
} from "../../lib/types/catalogPageTypes";
import { CatalogShowcaseCard } from "../components/CatalogShowcaseCard";

/**
 * CatalogShowcaseSection
 *
 * "Explore our best" row: the shared section header (accent bar, title,
 * subtitle) over the two product groups (clothing, accessories) as photo
 * cards, each narrowing the catalog to that group.
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
      <HomeSectionHeader title={t("title")} subtitle={t("subtitle")} className="mb-10" />

      <div className="grid max-w-3xl grid-cols-2 gap-4 sm:gap-6">
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
