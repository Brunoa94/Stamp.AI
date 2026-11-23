"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type {
  CatalogGroupFilterType,
  CatalogGroupSectionType,
  CatalogSortOptionType,
} from "../../lib/types/catalogPageTypes";
import { CatalogGroupSelect } from "./CatalogGroupSelect";
import { CatalogSearchInput } from "./CatalogSearchInput";
import { CatalogSortSelect } from "./CatalogSortSelect";

/**
 * CatalogToolbar
 *
 * Catalog browsing controls mirroring the orders page filter section,
 * on a rounded cream panel: an amber "filters" eyebrow over a row of selects (group,
 * sort) with a clear action, and a prominent full-width search bar
 * underneath.
 */

interface PropsI {
  sections: CatalogGroupSectionType[];
  group: CatalogGroupFilterType;
  query: string;
  sort: CatalogSortOptionType;
  onGroupChange: (group: CatalogGroupFilterType) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: CatalogSortOptionType) => void;
  onClearFilters: () => void;
}

export function CatalogToolbar({
  sections,
  group,
  query,
  sort,
  onGroupChange,
  onQueryChange,
  onSortChange,
  onClearFilters,
}: PropsI) {
  const t = useTranslations("catalog.toolbar");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-4 sm:p-6">
      <Span as="p" variant="label" className="text-(--color-stamp-gold-text)">
        {t("filteringLabel")}
      </Span>

      <div className="flex flex-wrap items-center gap-4">
        <CatalogGroupSelect
          sections={sections}
          group={group}
          onGroupChange={onGroupChange}
        />

        <CatalogSortSelect sort={sort} onSortChange={onSortChange} />

        <Button onClick={onClearFilters} variant="stamp-filter-ghost">
          <RotateCcw aria-hidden className="size-4" />
          {t("clearFilters")}
        </Button>
      </div>

      <CatalogSearchInput query={query} onQueryChange={onQueryChange} />
    </div>
  );
}
