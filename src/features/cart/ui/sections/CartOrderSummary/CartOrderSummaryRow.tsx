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
  valueClassName = "text-sm font-bold tabular-nums",
}: CartOrderSummaryRowPropsI) {
  return (
    <div className="flex items-center justify-between">
      <dt>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {label}
        </Span>
      </dt>
      <dd>
        <Span unstyled className={valueClassName}>
          {value}
        </Span>
      </dd>
    </div>
  );
}
