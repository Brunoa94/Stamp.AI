import { cn } from "@/lib/utils";

type PriceRowVariant = "normal" | "discount" | "total";

interface PriceRowProps {
  label: string;
  value: string | number;
  variant?: PriceRowVariant;
}

/**
 * PriceRow - Single price line item component
 * Used in price breakdowns to display pricing information
 */
export function PriceRow({ label, value, variant = "normal" }: PriceRowProps) {
  const formattedValue = typeof value === "number" ? `$${value.toFixed(2)}` : value;

  const labelClasses = cn(
    "text-sm font-bold uppercase tracking-wider",
    variant === "total"
      ? "text-xl font-heading font-extrabold tracking-tight text-slate-900"
      : "text-slate-500",
  );

  const valueClasses = cn(
    "font-bold",
    variant === "normal" && "text-base text-slate-900",
    variant === "discount" && "text-base text-green-600",
    variant === "total" && "text-3xl font-heading font-extrabold text-purple-900",
  );

  const containerClasses = cn(
    "flex justify-between items-center",
    variant === "total" ? "items-baseline border-t border-gray-100 pt-4" : "",
  );

  return (
    <div className={containerClasses}>
      <span className={labelClasses}>{label}</span>
      <span className={valueClasses}>{formattedValue}</span>
    </div>
  );
}
