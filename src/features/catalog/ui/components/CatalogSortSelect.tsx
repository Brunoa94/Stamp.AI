"use client";

import { useTranslations } from "next-intl";
import { buttonVariants } from "@/features/ui/button";
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
        className={buttonVariants({ variant: "stamp-filter", className: "w-auto min-w-40" })}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CATALOG_SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {t(`sortOptions.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
