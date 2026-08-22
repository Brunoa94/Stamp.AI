import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * OrdersFulfilledCounter
 *
 * Social proof counter displaying fulfilled orders count.
 * Shows a rounded number with package icon for visual appeal.
 */

interface OrdersFulfilledCounterProps {
  className?: string;
  count?: number;
  variant?: "default" | "compact" | "hero";
}

export function OrdersFulfilledCounter({
  className,
  count = 10000,
  variant = "default",
}: OrdersFulfilledCounterProps) {
  const t = useTranslations("trust.socialProof");

  // Format number with K suffix for thousands
  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return `${num}+`;
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-(--color-stamp-chocolate)/60",
          className
        )}
      >
        <Package className="h-3 w-3 text-(--color-stamp-gold)" aria-hidden="true" />
        <Span variant="micro" className="text-[10px] tracking-wider">
          {t("ordersFulfilled", { count: formatCount(count) })}
        </Span>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-(--color-stamp-chocolate)/70",
          className
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-stamp-gold)/10">
          <Package className="h-3.5 w-3.5 text-(--color-stamp-gold)" aria-hidden="true" />
        </div>
        <Span variant="sm" className="font-medium">
          {t("ordersFulfilled", { count: formatCount(count) })}
        </Span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-3 py-1.5",
        className
      )}
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-(--color-stamp-gold)/10">
        <Package className="h-3 w-3 text-(--color-stamp-gold)" aria-hidden="true" />
      </div>
      <Span variant="micro" className="text-[10px] font-bold tracking-wider text-(--color-stamp-chocolate)">
        {t("ordersFulfilled", { count: formatCount(count) })}
      </Span>
    </div>
  );
}
