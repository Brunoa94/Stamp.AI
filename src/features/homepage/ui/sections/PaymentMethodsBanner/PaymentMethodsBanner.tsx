/**
 * PaymentMethodsBanner
 *
 * Light banner displaying payment method icons and trust indicators.
 * Placed below the hero section to reinforce trust signals.
 * Similar to AboutYou's payment methods row.
 */

import { Truck, RefreshCcw, Lock, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { PAYMENT_ICONS } from "@/shared/constants/paymentIcons";
import { TRUST_GUARANTEE_METRICS } from "@/shared/constants/trustMetrics";

export function PaymentMethodsBanner() {
  const t = useTranslations("home.paymentBanner");

  const trustItems = [
    {
      icon: Lock,
      text: t("securePayment"),
    },
    {
      icon: Truck,
      text: t("freeShipping", { threshold: TRUST_GUARANTEE_METRICS.freeShippingThreshold }),
    },
    {
      icon: Clock,
      text: t("fastDelivery"),
    },
    {
      icon: RefreshCcw,
      text: t("returns", { days: TRUST_GUARANTEE_METRICS.guaranteeDays }),
    },
  ];

  return (
    <div className="w-full border-y border-(--color-stamp-divider) bg-(--color-stamp-white)">
      {/* Trust indicators row */}
      <div className="flex items-center justify-center gap-6 border-b border-(--color-stamp-divider) px-4 py-3 sm:gap-10 sm:px-6 md:gap-16 lg:gap-24 lg:px-12">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
          >
            <item.icon aria-hidden className="h-5 w-5 shrink-0 text-(--color-stamp-gold-text)" strokeWidth={1.5} />
            <Span
              variant="micro"
              className="text-sm text-(--color-stamp-chocolate) md:text-base"
            >
              {item.text}
            </Span>
          </div>
        ))}
      </div>

      {/* Payment icons row */}
      <div className="flex items-center justify-center gap-6 px-4 py-4 sm:gap-8 sm:px-6 md:gap-12 lg:gap-16 lg:px-12">
        <Span
          variant="label"
          className="text-(--color-stamp-taupe)"
        >
          {t("trustedProviders")}
        </Span>
        {PAYMENT_ICONS.map((payment) => (
          <div
            key={payment.id}
            className="flex h-10 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
          >
            {payment.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
