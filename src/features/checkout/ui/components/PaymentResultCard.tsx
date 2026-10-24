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
        "min-h-screen flex justify-center pt-20 items-center px-6 bg-(--color-stamp-cream)",
        className,
      )}
    >
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
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
