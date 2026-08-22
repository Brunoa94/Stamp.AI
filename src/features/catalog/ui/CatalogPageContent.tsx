"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { groupCatalogSections } from "../lib/helpers/groupCatalogSections";
import { useCatalogFilters } from "../lib/hooks/useCatalogFilters";
import type { CatalogCategorySectionType } from "../lib/types/catalogPageTypes";
import { CatalogEmptyResults } from "./components/CatalogEmptyResults";
import { CatalogToolbar } from "./components/CatalogToolbar";
import { CatalogGroupSection } from "./sections/CatalogGroupSection";
import { CatalogShowcaseSection } from "./sections/CatalogShowcaseSection";

/**
 * CatalogPageContent
 *
 * Full product catalog, marketplace-style: page header, orders-style
 * filter panel with a prominent search bar, a "explore our best" group
 * showcase, and one product section per group (clothing, accessories).
 * While browsing the full catalog each section previews its first row
 * with a "See all" action; filtering runs client-side over the cached
 * sections.
 */

interface PropsI {
  sections: CatalogCategorySectionType[];
}

export function CatalogPageContent({ sections }: PropsI) {
  const t = useTranslations("catalog");
  const groupSections = groupCatalogSections(sections);
  const filters = useCatalogFilters(groupSections);

  const isBrowsingAll = filters.group === "all" && filters.query.trim() === "";

  return (
    <article className="px-6 pt-40 pb-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-12 space-y-4">
          <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
          <Heading
            as="h1"
            variant="title"
            className="text-(--color-stamp-chocolate)"
          >
            {t("title")}{" "}
            <Span variant="serif" className="text-(--color-stamp-taupe)">
              {t("accent")}
            </Span>
          </Heading>
        </header>

        <Paragraph
          variant="lead"
          className="mb-16 text-(--color-stamp-chocolate)/80"
        >
          {t("intro")}
        </Paragraph>

        {groupSections.length === 0 ? (
          <Span
            role="status"
            variant="default"
            className="block py-16 text-center text-(--color-stamp-taupe)"
          >
            {t("emptyState")}
          </Span>
        ) : (
          <>
            <CatalogToolbar
              sections={groupSections}
              group={filters.group}
              query={filters.query}
              sort={filters.sort}
              onGroupChange={filters.setGroup}
              onQueryChange={filters.setQuery}
              onSortChange={filters.setSort}
              onClearFilters={filters.clearFilters}
            />

            {isBrowsingAll && (
              <div className="mt-16">
                <CatalogShowcaseSection
                  sections={groupSections}
                  onGroupSelect={filters.setGroup}
                />
              </div>
            )}

            {!isBrowsingAll &&
              (filters.filteredSections.length === 0 ? (
                <div className="mt-16">
                  <CatalogEmptyResults onClearFilters={filters.clearFilters} />
                </div>
              ) : (
                <div className="mt-16 space-y-24">
                  {filters.filteredSections.map((section) => (
                    <CatalogGroupSection
                      key={section.group}
                      section={section}
                      isPreview={false}
                      onSeeAll={() => filters.setGroup(section.group)}
                    />
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </article>
  );
}
