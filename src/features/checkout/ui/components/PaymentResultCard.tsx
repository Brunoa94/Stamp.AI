import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  paymentResultBarVariants,
  paymentResultIconVariants,
} from "@/features/checkout/lib/variants/paymentResultVariants";

type PaymentResultToneT = "success" | "error" | "pending";

interface Props {
  ariaLabel: string;
  tone: PaymentResultToneT;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Payment result page: one centred card in the shared style (white
 * rounded-xl, divider border, soft shadow) on the off-white page, below the
 * fixed header and inside the page gutter. A tone-coloured bar along the top
 * and a round status icon repeat the result the heading states.
 */
export function PaymentResultCard({
  ariaLabel,
  tone,
  icon,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-(--color-stamp-off-white) px-4 pb-16 pt-28 sm:px-6 lg:px-12",
        className,
      )}
    >
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="relative overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 text-center shadow-(--shadow-stamp-card) md:p-12"
          aria-label={ariaLabel}
        >
          {/* Top accent bar */}
          <div
            className={paymentResultBarVariants({ tone })}
            aria-hidden="true"
          />

          {/* Status icon */}
          <div
            className={paymentResultIconVariants({ tone })}
            aria-hidden="true"
          >
            {icon}
          </div>

          {children}
        </section>
      </div>
    </div>
  );
}
