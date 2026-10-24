"use client";

import { Truck, RefreshCcw, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { TRUST_GUARANTEE_METRICS } from "@/shared/constants/trustMetrics";

/** Gap between each label landing, so they fall one after another */
const FALL_STAGGER_MS = 120;

interface PropsI {
  /** Labels fall in from above while true and lift back out while false */
  isDropped: boolean;
}

/**
 * TopTrustBannerItems
 *
 * The shipping, returns and secure-payment labels of the top trust banner.
 */
export function TopTrustBannerItems({ isDropped }: PropsI) {
  const t = useTranslations("home.topBanner");

  const trustItems = [
    {
      icon: Truck,
      text: t("freeShipping", {
        threshold: TRUST_GUARANTEE_METRICS.freeShippingThreshold,
      }),
    },
    {
      icon: RefreshCcw,
      text: t("returns", { days: TRUST_GUARANTEE_METRICS.guaranteeDays }),
    },
    {
      icon: Lock,
      text: t("securePayment"),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 sm:gap-12 md:gap-16 lg:gap-24">
      {trustItems.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2 transition-all duration-500 ease-out motion-reduce:transition-none",
            !isDropped && "-translate-y-6 opacity-0",
          )}
          style={{ transitionDelay: `${isDropped ? index * FALL_STAGGER_MS : 0}ms` }}
        >
          <item.icon
            className="h-4 w-4 text-(--color-stamp-gold)"
            strokeWidth={2}
          />
          <Span
            variant="micro"
            className="font-semibold uppercase tracking-widest text-(--color-stamp-white)"
          >
            {item.text}
          </Span>
        </div>
      ))}
    </div>
  );
}
