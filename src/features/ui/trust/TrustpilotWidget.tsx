"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import {
  TRUST_REVIEW_METRICS,
  TRUSTPILOT_CONFIG,
} from "@/shared/constants/trustMetrics";

/**
 * TrustpilotWidget
 *
 * Trustpilot-style review widget that can embed actual Trustpilot widget
 * or display static rating data. Includes link to actual Trustpilot page.
 */

interface TrustpilotWidgetProps {
  className?: string;
  rating?: number;
  reviewCount?: number;
  variant?: "default" | "compact" | "inline";
  trustpilotUrl?: string;
}

export function TrustpilotWidget({
  className,
  rating = TRUST_REVIEW_METRICS.overallRating,
  reviewCount = TRUST_REVIEW_METRICS.totalReviews,
  variant = "default",
  trustpilotUrl = TRUSTPILOT_CONFIG.reviewUrl,
}: TrustpilotWidgetProps) {
  const t = useTranslations("trust.reviews");

  const renderStars = (size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5" aria-label={t("ariaLabel", { rating, total: 5 })}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < fullStars
                ? "fill-(--color-stamp-gold) text-(--color-stamp-gold)"
                : i === fullStars && hasHalfStar
                  ? "fill-(--color-stamp-gold)/50 text-(--color-stamp-gold)"
                  : "fill-(--color-stamp-divider) text-(--color-stamp-divider)"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  if (variant === "inline") {
    return (
      <a
        href={trustpilotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 text-(--color-stamp-chocolate)/70 transition-colors hover:text-(--color-stamp-chocolate)",
          className
        )}
      >
        {renderStars("sm")}
        <Span variant="micro" className="text-[10px] tracking-wider">
          {rating} · {t("reviewCount", { count: reviewCount })}
        </Span>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={trustpilotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 transition-opacity hover:opacity-80",
          className
        )}
      >
        <div className="flex flex-col items-start gap-0.5">
          {renderStars("sm")}
          <Span variant="micro" className="text-[9px] tracking-wider text-(--color-stamp-taupe)">
            {t("reviewCount", { count: reviewCount })}
          </Span>
        </div>
        <div className="h-6 w-px bg-(--color-stamp-divider)" />
        <Span
          variant="micro"
          className="text-[10px] font-bold tracking-wider text-[#00b67a]"
        >
          Trustpilot
        </Span>
      </a>
    );
  }

  return (
    <a
      href={trustpilotUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex flex-col gap-3 p-4 transition-opacity hover:opacity-80",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {renderStars()}
            <Span variant="sm" className="font-bold text-(--color-stamp-chocolate)">
              {rating}
            </Span>
          </div>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {t("basedOn", { count: reviewCount })}
          </Paragraph>
        </div>
        <div className="flex flex-col items-end">
          <Span
            variant="micro"
            className="text-[11px] font-bold tracking-wider text-[#00b67a]"
          >
            Trustpilot
          </Span>
          <Span variant="micro" className="text-[9px] text-(--color-stamp-taupe)">
            {t("verified")}
          </Span>
        </div>
      </div>
    </a>
  );
}
