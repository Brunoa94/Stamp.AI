/**
 * HomePaymentMethods
 *
 * Payment method icons section with secure payment badge.
 * Displays trusted payment providers (Visa, Mastercard, etc.)
 */

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { PAYMENT_ICONS } from "../../lib/constants/paymentIcons";

export function HomePaymentMethods() {
  const t = useTranslations("home.guarantees");

  return (
    <div className="mt-16 flex flex-col items-center">
      <div className="mb-6 flex items-center gap-2">
        <Lock className="h-4 w-4 text-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="uppercase tracking-widest text-(--color-stamp-chocolate)"
        >
          {t("paymentTitle")}
        </Span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        {PAYMENT_ICONS.map((payment) => (
          <div
            key={payment.id}
            className="flex h-14 items-center justify-center rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 transition-colors duration-300 hover:border-(--color-stamp-gold)"
          >
            {payment.icon}
          </div>
        ))}
      </div>

      <Paragraph
        variant="sm"
        className="max-w-md text-center text-(--color-stamp-taupe)"
      >
        {t("paymentDescription")}
      </Paragraph>
    </div>
  );
}
