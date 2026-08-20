"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { CATALOG_SORT_OPTIONS } from "../../lib/constants/catalogSortOptions";
import type { CatalogSortOptionType } from "../../lib/types/catalogPageTypes";

/**
 * CatalogSortSelect
 *
 * Toolbar sort order select: featured (server ranking), price both
 * ways, and name, applied inside each category section.
 */

interface PropsI {
  sort: CatalogSortOptionType;
  onSortChange: (sort: CatalogSortOptionType) => void;
}

export function CatalogSortSelect({ sort, onSortChange }: PropsI) {
  const t = useTranslations("catalog.toolbar");

  return (
    <Select
      value={sort}
      onValueChange={(value) => onSortChange(value as CatalogSortOptionType)}
    >
      <SelectTrigger
        aria-label={t("sortAria")}
        className="h-11 w-full rounded-none border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 font-body text-sm text-(--color-stamp-chocolate) shadow-none focus:ring-(--color-stamp-gold)/30 sm:w-56"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-none border-(--color-stamp-divider) bg-(--color-stamp-off-white)">
        {CATALOG_SORT_OPTIONS.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="rounded-none font-body text-sm text-(--color-stamp-chocolate)"
          >
            {t(`sortOptions.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
