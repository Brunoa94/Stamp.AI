"use client";

import { useTranslations } from "next-intl";
import { countCatalogProducts } from "../../lib/helpers/filterCatalogSections";
import type {
  CatalogCategoryFilterType,
  CatalogCategorySectionType,
} from "../../lib/types/catalogPageTypes";
import { CatalogCategoryPill } from "./CatalogCategoryPill";

/**
 * CatalogCategoryNav
 *
 * Category filter over the catalog: an "all products" pill plus one
 * pill per non-empty category, each with its product count. Selecting
 * a pill narrows the grid to that category.
 */

interface PropsI {
  sections: CatalogCategorySectionType[];
  activeCategory: CatalogCategoryFilterType;
  onCategoryChange: (category: CatalogCategoryFilterType) => void;
}

export function CatalogCategoryNav({
  sections,
  activeCategory,
  onCategoryChange,
}: PropsI) {
  const t = useTranslations("catalog");

  return (
    <nav aria-label={t("categoryNavAria")}>
      <ul className="flex flex-wrap gap-2 sm:gap-3">
        <li>
          <CatalogCategoryPill
            label={t("allCategory")}
            count={countCatalogProducts(sections)}
            isActive={activeCategory === "all"}
            onSelect={() => onCategoryChange("all")}
          />
        </li>
        {sections.map((section) => (
          <li key={section.category}>
            <CatalogCategoryPill
              label={t(`categories.${section.category}`)}
              count={section.products.length}
              isActive={activeCategory === section.category}
              onSelect={() => onCategoryChange(section.category)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
