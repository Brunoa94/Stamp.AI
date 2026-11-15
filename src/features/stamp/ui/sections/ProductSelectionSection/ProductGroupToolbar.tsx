import { useId } from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type { ProductGroup } from "../../../lib/helpers/productCategoryDetector";
import type { StampProductSectionT } from "../../../lib/types/productSectionTypes";

/**
 * ProductGroupToolbar
 *
 * Category selector that opens the product step, mirroring the catalog
 * toolbar: a cream panel with a "product category" label naming a
 * stamp-filter select that lists each group with products, with its count.
 */

interface PropsI {
  sections: StampProductSectionT[];
  group: ProductGroup;
  onGroupChange: (group: ProductGroup) => void;
}

export function ProductGroupToolbar({ sections, group, onGroupChange }: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const labelId = useId();

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-stamp-divider) bg-(--color-stamp-cream) px-4 py-4 lg:px-6">
      <Span
        id={labelId}
        variant="default"
        className="font-bold text-sm tracking-[0.4em] text-(--color-stamp-taupe)"
      >
        {t("groupLabel")}
      </Span>

      <Select
        value={group}
        onValueChange={(value) => onGroupChange(value as ProductGroup)}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          className={buttonVariants({
            variant: "stamp-filter",
            className: "w-auto min-w-48 bg-(--color-stamp-white)",
          })}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section.group} value={section.group}>
              {t(`groups.${section.group}`, { count: section.products.length })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
