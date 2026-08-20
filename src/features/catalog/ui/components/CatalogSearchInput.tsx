"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/ui/input";

/**
 * CatalogSearchInput
 *
 * Toolbar search field filtering catalog products by name and
 * description as the user types.
 */

interface PropsI {
  query: string;
  onQueryChange: (query: string) => void;
}

export function CatalogSearchInput({ query, onQueryChange }: PropsI) {
  const t = useTranslations("catalog.toolbar");

  return (
    <div className="relative flex-1">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-(--color-stamp-taupe)"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        className="h-11 rounded-none border-(--color-stamp-divider) bg-(--color-stamp-white) pl-11 font-body text-sm text-(--color-stamp-chocolate) shadow-none placeholder:text-(--color-stamp-taupe) focus-visible:border-(--color-stamp-gold) focus-visible:ring-(--color-stamp-gold)/20"
      />
    </div>
  );
}
