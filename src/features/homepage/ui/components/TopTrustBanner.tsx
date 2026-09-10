/**
 * TopTrustBanner
 *
 * Dark banner fixed right below the navbar displaying key trust indicators.
 * Similar to AboutYou's top banner with shipping, returns, and payment info.
 * Fixed position at top-24 (below the h-24 header).
 */

"use client";

import { Truck, RefreshCcw, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { TRUST_GUARANTEE_METRICS } from "@/shared/constants/trustMetrics";

export function TopTrustBanner() {
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
    <div className="relative w-full bg-(--color-stamp-chocolate) py-2.5 mt-26">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 sm:gap-12 md:gap-16 lg:gap-24">
        {trustItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
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
    </div>
  );
}
