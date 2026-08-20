"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type {
  CatalogCategoryFilterType,
  CatalogCategorySectionType,
  CatalogSortOptionType,
} from "../../lib/types/catalogPageTypes";
import { CatalogCategoryNav } from "./CatalogCategoryNav";
import { CatalogSearchInput } from "./CatalogSearchInput";
import { CatalogSortSelect } from "./CatalogSortSelect";

/**
 * CatalogToolbar
 *
 * Catalog browsing controls: category filter pills, product search,
 * sort order and a live result count. Sticky below the fixed h-24
 * header on desktop so the controls stay reachable while scrolling
 * the grid.
 */

interface PropsI {
  sections: CatalogCategorySectionType[];
  category: CatalogCategoryFilterType;
  query: string;
  sort: CatalogSortOptionType;
  resultCount: number;
  onCategoryChange: (category: CatalogCategoryFilterType) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: CatalogSortOptionType) => void;
}

export function CatalogToolbar({
  sections,
  category,
  query,
  sort,
  resultCount,
  onCategoryChange,
  onQueryChange,
  onSortChange,
}: PropsI) {
  const t = useTranslations("catalog.toolbar");

  return (
    <div className="border-y border-(--color-stamp-divider) bg-(--color-stamp-off-white)/95 py-5 backdrop-blur-md lg:sticky lg:top-24 lg:z-30">
      <CatalogCategoryNav
        sections={sections}
        activeCategory={category}
        onCategoryChange={onCategoryChange}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CatalogSearchInput query={query} onQueryChange={onQueryChange} />
        <CatalogSortSelect sort={sort} onSortChange={onSortChange} />
        <Span
          role="status"
          variant="micro"
          className="shrink-0 text-(--color-stamp-taupe) sm:pl-2"
        >
          {t("resultsCount", { count: resultCount })}
        </Span>
      </div>
    </div>
  );
}
