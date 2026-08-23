"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

/**
 * TrustpilotReviewButton
 *
 * Call-to-action button for customers to leave a Trustpilot review
 * after completing an order. Links to the Trustpilot review page.
 */

interface TrustpilotReviewButtonProps {
  className?: string;
  variant?: "default" | "prominent";
  trustpilotUrl?: string;
}

export function TrustpilotReviewButton({
  className,
  variant = "default",
  trustpilotUrl = "https://www.trustpilot.com/evaluate/stamp.ai",
}: TrustpilotReviewButtonProps) {
  const t = useTranslations("trust.reviewCta");

  if (variant === "prominent") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <Span variant="micro" className="text-[10px] tracking-wider text-(--color-stamp-taupe)">
          {t("enjoyedExperience")}
        </Span>
        <Button
          asChild
          className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase bg-[#00b67a] text-white hover:bg-[#00a06a]"
        >
          <a
            href={trustpilotUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Star className="h-4 w-4 mr-2 fill-white" aria-hidden="true" />
            {t("leaveReview")}
          </a>
        </Button>
        <Span variant="micro" className="text-[9px] text-(--color-stamp-chocolate)/40">
          {t("poweredBy")} <span className="font-bold text-[#00b67a]">Trustpilot</span>
        </Span>
      </div>
    );
  }

  return (
    <a
      href={trustpilotUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-all hover:border-[#00b67a]",
        className
      )}
    >
      <Star className="h-4 w-4 fill-[#00b67a] text-[#00b67a]" aria-hidden="true" />
      <Span variant="micro" className="text-[10px] font-bold tracking-wider text-(--color-stamp-chocolate)">
        {t("rateUs")}
      </Span>
      <Span variant="micro" className="text-[10px] tracking-wider text-[#00b67a]">
        Trustpilot
      </Span>
    </a>
  );
}
