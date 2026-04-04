import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

/**
 * SummaryRow - A generic component for displaying label-value pairs in a summary layout
 *
 * @example
 * ```tsx
 * <SummaryRow
 *   label="Subtotal"
 *   value="$24.99"
 * />
 *
 * <SummaryRow
 *   label={<span>Shipping <span className="text-xs">(2-3 days)</span></span>}
 *   value={shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
 * />
 * ```
 */
export function SummaryRow({
  label,
  value,
  className,
  labelClassName,
  valueClassName
}: Props) {
  return (
    <div
      className={clsx(
        "flex justify-between text-gray-600",
        className
      )}
    >
      <span className={labelClassName}>
        {label}
      </span>
      <span className={clsx("font-medium", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
