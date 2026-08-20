"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { useCatalogFilters } from "../lib/hooks/useCatalogFilters";
import type { CatalogCategorySectionType } from "../lib/types/catalogPageTypes";
import { CatalogEmptyResults } from "./components/CatalogEmptyResults";
import { CatalogToolbar } from "./components/CatalogToolbar";
import { CatalogCategorySection } from "./sections/CatalogCategorySection";

/**
 * CatalogPageContent
 *
 * Full product catalog: page header, browsing toolbar (category pills,
 * search, sort) and one product grid per matching category. The initial
 * server render shows the complete catalog; filtering runs client-side
 * over the cached sections.
 */

interface PropsI {
  sections: CatalogCategorySectionType[];
}

export function CatalogPageContent({ sections }: PropsI) {
  const t = useTranslations("catalog");
  const filters = useCatalogFilters(sections);

  return (
    <article className="px-6 pt-40 pb-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-12 space-y-4">
          <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
          <Heading
            as="h1"
            variant="sectionDisplay"
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
          className="mb-16 max-w-3xl text-(--color-stamp-chocolate)/80"
        >
          {t("intro")}
        </Paragraph>

        {sections.length === 0 ? (
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
              sections={sections}
              category={filters.category}
              query={filters.query}
              sort={filters.sort}
              resultCount={filters.resultCount}
              onCategoryChange={filters.setCategory}
              onQueryChange={filters.setQuery}
              onSortChange={filters.setSort}
            />

            {filters.filteredSections.length === 0 ? (
              <div className="mt-16">
                <CatalogEmptyResults onClearFilters={filters.clearFilters} />
              </div>
            ) : (
              <div className="mt-16 space-y-24">
                {filters.filteredSections.map((section) => (
                  <CatalogCategorySection
                    key={section.category}
                    section={section}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
