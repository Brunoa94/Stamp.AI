/**
 * CartSelectionHeader
 *
 * Selection controls for cart items: select all / deselect all with item count.
 */

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Checkbox } from "@/features/ui/checkbox";
import { Span } from "@/features/ui/span";

interface CartSelectionHeaderPropsI {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function CartSelectionHeader({
  totalCount,
  selectedCount,
  allSelected,
  someSelected,
  onSelectAll,
  onDeselectAll,
}: CartSelectionHeaderPropsI) {
  const t = useTranslations("cart.selection");

  const checkedState = allSelected ? true : someSelected ? "indeterminate" : false;

  const handleToggle = () => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--color-stamp-divider) pb-3">
      <div className="flex items-center gap-4">
        {/* Master checkbox */}
        <Checkbox
          variant="stamp"
          checked={checkedState}
          onCheckedChange={handleToggle}
          aria-label={
            allSelected ? t("deselectAll") : t("selectAll", { count: totalCount })
          }
        />

        <Span variant="label" className="text-(--color-stamp-taupe)">
          {t("selectedCount", { selected: selectedCount, total: totalCount })}
        </Span>
      </div>

      <Button
        variant="stamp-filter-ghost"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="-mr-4"
      >
        {allSelected ? t("deselectAll") : t("selectAll", { count: totalCount })}
      </Button>
    </div>
  );
}
