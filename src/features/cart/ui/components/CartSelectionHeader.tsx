/**
 * CartSelectionHeader
 *
 * Selection controls for cart items: select all / deselect all with item count.
 * Styled in the luxury brutalist aesthetic.
 */

"use client";

import { useTranslations } from "next-intl";

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

  const handleToggle = () => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-(--color-stamp-divider) pb-4">
      <div className="flex items-center gap-4">
        {/* Master checkbox */}
        <label className="relative flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={handleToggle}
            className="peer sr-only"
            aria-label={
              allSelected ? t("deselectAll") : t("selectAll", { count: totalCount })
            }
          />
          <div
            className={`flex h-6 w-6 items-center justify-center border-2 transition-all duration-200 ${
              allSelected || someSelected
                ? "border-(--color-stamp-gold) bg-(--color-stamp-gold)"
                : "border-(--color-stamp-chocolate-light) bg-(--color-stamp-white) hover:border-(--color-stamp-gold)"
            }`}
          >
            {allSelected && (
              <svg
                className="h-4 w-4 text-(--color-stamp-white)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {someSelected && !allSelected && (
              <svg
                className="h-4 w-4 text-(--color-stamp-white)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 12h14"
                />
              </svg>
            )}
          </div>
        </label>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-taupe)">
          {t("selectedCount", { selected: selectedCount, total: totalCount })}
        </span>
      </div>

      <button
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-gold)"
      >
        {allSelected ? t("deselectAll") : t("selectAll", { count: totalCount })}
      </button>
    </div>
  );
}
