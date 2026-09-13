"use client";

import { useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { groupCatalogSections } from "../lib/helpers/groupCatalogSections";
import { useCatalogFilters } from "../lib/hooks/useCatalogFilters";
import type {
  CatalogCategorySectionType,
  CatalogGroupFilterType,
} from "../lib/types/catalogPageTypes";
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
  const resultsRef = useRef<HTMLDivElement>(null);

  const isBrowsingAll = filters.group === "all" && filters.query.trim() === "";

  const handleGroupSelect = useCallback(
    (group: CatalogGroupFilterType) => {
      filters.setGroup(group);
      // Smooth scroll to results after a brief delay for the transition
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [filters]
  );

  const handleBackToShowcase = useCallback(() => {
    filters.clearFilters();
    // Scroll back to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters]);

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

            <div
              className={`mt-16 transition-all duration-500 ease-out ${
                isBrowsingAll
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute pointer-events-none"
              }`}
            >
              {isBrowsingAll && (
                <CatalogShowcaseSection
                  sections={groupSections}
                  onGroupSelect={handleGroupSelect}
                />
              )}
            </div>

            <div
              ref={resultsRef}
              className={`scroll-mt-32 transition-all duration-500 ease-out ${
                !isBrowsingAll
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute pointer-events-none"
              }`}
            >
              {!isBrowsingAll && (
                <>
                  <div className="mt-16 mb-8">
                    <Button
                      type="button"
                      variant="ghost-stamp"
                      onClick={handleBackToShowcase}
                      className="gap-2 px-0 py-2 text-sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("backToShowcase")}
                    </Button>
                  </div>

                  {filters.filteredSections.length === 0 ? (
                    <CatalogEmptyResults onClearFilters={filters.clearFilters} />
                  ) : (
                    <div className="space-y-24">
                      {filters.filteredSections.map((section) => (
                        <CatalogGroupSection
                          key={section.group}
                          section={section}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
