"use client";

import { Span } from "@/features/ui/span";

/**
 * CatalogCategoryPill
 *
 * One toggle pill of the category filter: label plus product count,
 * pressed state inverts to the chocolate fill. Raw <button> by design:
 * the Button atom only ships CTA variants and the pill's styling is
 * driven by aria-pressed.
 */

interface PropsI {
  label: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}

export function CatalogCategoryPill({
  label,
  count,
  isActive,
  onSelect,
}: PropsI) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={`inline-flex items-baseline gap-2 border px-4 py-2.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold) ${
        isActive
          ? "border-(--color-stamp-chocolate) bg-(--color-stamp-chocolate)"
          : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-gold)"
      }`}
    >
      <Span
        variant="micro"
        className={
          isActive
            ? "text-(--color-stamp-white)"
            : "text-(--color-stamp-chocolate)"
        }
      >
        {label}
      </Span>
      <Span
        variant="micro"
        className={
          isActive
            ? "text-(--color-stamp-white)/70"
            : "text-(--color-stamp-taupe)"
        }
      >
        {count}
      </Span>
    </button>
  );
}
