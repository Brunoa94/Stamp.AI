"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

/**
 * CatalogEmptyResults
 *
 * Empty state for a filter/search combination with no matches: says
 * what happened and offers one action back to the full catalog.
 */

interface PropsI {
  onClearFilters: () => void;
}

export function CatalogEmptyResults({ onClearFilters }: PropsI) {
  const t = useTranslations("catalog.noResults");

  return (
    <div
      role="status"
      className="border border-(--color-stamp-divider) bg-(--color-stamp-cream) px-6 py-16 text-center"
    >
      <Heading
        as="h2"
        variant="cardCompact"
        className="text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>
      <Paragraph
        variant="xs"
        className="mx-auto mt-2 max-w-md text-(--color-stamp-taupe)"
      >
        {t("body")}
      </Paragraph>
      <Button
        variant="secondary-compact"
        className="mt-6"
        onClick={onClearFilters}
      >
        {t("clearFilters")}
      </Button>
    </div>
  );
}
