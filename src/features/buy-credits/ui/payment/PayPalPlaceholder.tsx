"use client";

import { FaPaypal } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";

export function PayPalPlaceholder() {
  const t = useTranslations("buyCredits.payment");

  return (
    <div className="rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-6 text-center">
      <FaPaypal className="w-12 h-12 text-(--color-stamp-chocolate) mx-auto mb-3" />
      <Paragraph unstyled className="font-body text-sm text-(--color-stamp-chocolate)">
        {t("paypalComingSoon")}
      </Paragraph>
      <Paragraph variant="caption" className="mt-1 text-(--color-stamp-taupe)">
        {t("paypalUseCard")}
      </Paragraph>
    </div>
  );
}
