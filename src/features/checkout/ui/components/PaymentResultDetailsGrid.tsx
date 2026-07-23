import clsx from "clsx";
import { Span } from "@/features/ui/span";

interface PaymentResultGridItemI {
  label: string;
  value: string;
  valueMuted?: boolean;
}

interface Props {
  items: PaymentResultGridItemI[];
  statusLabel: string;
  statusValue: string;
  statusVariant?: "success" | "error" | "pending";
}

export function PaymentResultDetailsGrid({
  items,
  statusLabel,
  statusValue,
  statusVariant = "success",
}: Props) {
  const getStatusColors = () => {
    switch (statusVariant) {
      case "success":
        return {
          dot: "bg-(--color-stamp-success) animate-pulse",
          text: "text-(--color-stamp-success)",
        };
      case "error":
        return {
          dot: "bg-(--color-stamp-error)",
          text: "text-(--color-stamp-error)",
        };
      case "pending":
        return {
          dot: "bg-(--color-stamp-gold) animate-pulse",
          text: "text-(--color-stamp-gold)",
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <div
      className="grid grid-cols-2 gap-8 text-left border-y border-(--color-stamp-divider) py-8 mb-12"
      aria-live="polite"
    >
      {items.map((item) => (
        <div className="flex flex-col gap-1" key={item.label}>
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {item.label}
          </Span>
          <span
            className={clsx(
              "font-heading text-base uppercase tracking-wide",
              item.valueMuted
                ? "text-(--color-stamp-taupe)"
                : "text-(--color-stamp-chocolate)"
            )}
          >
            {item.value}
          </span>
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {statusLabel}
        </Span>
        <div className="flex items-center gap-2">
          <span
            className={clsx("w-2 h-2 rounded-full", statusColors.dot)}
            aria-hidden="true"
          />
          <span
            className={clsx(
              "font-heading text-lg uppercase tracking-wide font-bold",
              statusColors.text
            )}
          >
            {statusValue}
          </span>
        </div>
      </div>
    </div>
  );
}
