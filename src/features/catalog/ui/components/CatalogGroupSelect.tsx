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
import type {
  CatalogGroupFilterType,
  CatalogGroupSectionType,
} from "../../lib/types/catalogPageTypes";

/**
 * CatalogGroupSelect
 *
 * Group filter select mirroring the orders page filter controls: all
 * products plus each product group (clothing, accessories) that has
 * products in the catalog.
 */

interface PropsI {
  sections: CatalogGroupSectionType[];
  group: CatalogGroupFilterType;
  onGroupChange: (group: CatalogGroupFilterType) => void;
}

export function CatalogGroupSelect({
  sections,
  group,
  onGroupChange,
}: PropsI) {
  const t = useTranslations("catalog");

  return (
    <Select
      value={group}
      onValueChange={(value) =>
        onGroupChange(value as CatalogGroupFilterType)
      }
    >
      <SelectTrigger
        aria-label={t("categoryNavAria")}
        className={buttonVariants({ variant: "stamp-filter", className: "w-auto min-w-48" })}
      >
        <SelectValue placeholder={t("allCategory")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("allCategory")}</SelectItem>
        {sections.map((section) => (
          <SelectItem key={section.group} value={section.group}>
            {t(`groups.${section.group}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
