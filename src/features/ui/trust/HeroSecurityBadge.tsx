import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * HeroSecurityBadge
 *
 * Simple, recognizable security badge for hero/above-fold placement.
 * Uses "Secure Checkout" messaging similar to Shopify/Amazon.
 */

interface HeroSecurityBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function HeroSecurityBadge({
  className,
  variant = "default",
}: HeroSecurityBadgeProps) {
  const t = useTranslations("trust.payment");

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-(--color-stamp-chocolate)/60",
          className
        )}
      >
        <Lock className="h-3 w-3 text-(--color-stamp-success)" aria-hidden="true" />
        <Span variant="micro" className="text-[10px] tracking-wider">
          {t("sslSecured")}
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
      <Lock className="h-3.5 w-3.5 text-(--color-stamp-success)" aria-hidden="true" />
      <Span variant="micro" className="text-[10px] font-bold tracking-wider text-(--color-stamp-chocolate)">
        {t("sslSecured")}
      </Span>
    </div>
  );
}
