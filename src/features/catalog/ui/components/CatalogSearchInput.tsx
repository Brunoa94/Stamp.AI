"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/ui/input";

/**
 * CatalogSearchInput
 *
 * Prominent full-width search bar filtering catalog products by name
 * and description as the user types, marketplace-style: tall, softly
 * rounded, with a leading search icon.
 */

interface PropsI {
  query: string;
  onQueryChange: (query: string) => void;
}

export function CatalogSearchInput({ query, onQueryChange }: PropsI) {
  const t = useTranslations("catalog.toolbar");

  return (
    <div className="relative w-full">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-(--color-stamp-taupe)"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        className="h-14 rounded-lg border-(--color-stamp-divider) bg-(--color-stamp-white) pl-13 font-body text-base text-(--color-stamp-chocolate) shadow-none placeholder:text-(--color-stamp-taupe) focus-visible:border-(--color-stamp-gold) focus-visible:ring-(--color-stamp-gold)/20"
      />
    </div>
  );
}
