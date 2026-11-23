/**
 * CartOrderSummaryRow
 *
 * Reusable row component for price breakdown items.
 * Displays a label and value with consistent styling.
 */

import { Span } from "@/features/ui/span";

interface CartOrderSummaryRowPropsI {
  label: string;
  value: string;
  valueClassName?: string;
}

export function CartOrderSummaryRow({
  label,
  value,
  valueClassName,
}: CartOrderSummaryRowPropsI) {
  return (
    <div className="flex items-center justify-between">
      <dt>
        <Span variant="value" className="text-(--color-stamp-taupe)">
          {label}
        </Span>
      </dt>
      <dd>
        <Span
          unstyled
          className={valueClassName ?? "font-body text-base font-bold tabular-nums text-(--color-stamp-chocolate)"}
        >
          {value}
        </Span>
      </dd>
    </div>
  );
}
