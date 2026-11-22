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
      {/* Trust indicators: a 2×2 grid on phones, one row from sm */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-(--color-stamp-divider) px-6 py-4 sm:flex sm:items-center sm:justify-center sm:gap-10 sm:py-3 md:gap-16 lg:gap-24">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
          >
            <item.icon className="h-4 w-4 text-(--color-stamp-taupe)" strokeWidth={1.5} />
            <Span
              variant="micro"
              className="text-(--color-stamp-chocolate)"
            >
              {item.text}
            </Span>
          </div>
        ))}
      </div>

      {/* Payment icons: the label gets its own line on phones and the logos wrap */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 py-4 sm:flex-nowrap sm:gap-8 md:gap-12 lg:gap-16">
        <Span
          variant="micro"
          className="w-full text-center text-(--color-stamp-taupe) uppercase tracking-widest sm:w-auto sm:text-left"
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
