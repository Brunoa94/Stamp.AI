import clsx from "clsx";
import { Span } from "@/features/ui/span";
import {
  paymentResultStatusDotVariants,
  paymentResultStatusTextVariants,
} from "@/features/checkout/lib/variants/paymentResultVariants";

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
          <Span
            unstyled
            className={clsx(
              "font-heading text-base uppercase tracking-wide",
              item.valueMuted
                ? "text-(--color-stamp-taupe)"
                : "text-(--color-stamp-chocolate)"
            )}
          >
            {item.value}
          </Span>
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {statusLabel}
        </Span>
        <div className="flex items-center gap-2">
          <Span
            unstyled
            className={paymentResultStatusDotVariants({ tone: statusVariant })}
            aria-hidden="true"
          />
          <Span
            unstyled
            className={paymentResultStatusTextVariants({ tone: statusVariant })}
          >
            {statusValue}
          </Span>
        </div>
      </div>
    </div>
  );
}
