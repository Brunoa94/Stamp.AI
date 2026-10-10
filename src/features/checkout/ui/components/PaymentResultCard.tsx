import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaymentResultToneT = "success" | "error" | "pending";

const TONE_CLASSES: Record<PaymentResultToneT, { bar: string; icon: string }> =
  {
    success: {
      bar: "bg-(--color-stamp-success)",
      icon: "bg-(--color-stamp-success)/10 text-(--color-stamp-success)",
    },
    error: {
      bar: "bg-(--color-stamp-error)",
      icon: "bg-(--color-stamp-error)/10 text-(--color-stamp-error)",
    },
    pending: {
      bar: "bg-(--color-stamp-gold)",
      icon: "bg-(--color-stamp-gold)/10 text-(--color-stamp-gold)",
    },
  };

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
  const toneClasses = TONE_CLASSES[tone];

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
            className={cn("absolute top-0 left-0 w-full h-1", toneClasses.bar)}
            aria-hidden="true"
          />

          {/* Status icon */}
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10",
              toneClasses.icon,
            )}
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
