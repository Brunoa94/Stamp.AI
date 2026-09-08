"use client";

import { FaPaypal } from "react-icons/fa";
import { useTranslations } from "next-intl";

export function PayPalPlaceholder() {
  const t = useTranslations("buyCredits.payment");

  return (
    <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center">
      <FaPaypal className="w-12 h-12 text-[#003087] mx-auto mb-3" />
      <p className="text-slate-600 text-sm">{t("paypalComingSoon")}</p>
      <p className="text-slate-400 text-xs mt-1">{t("paypalUseCard")}</p>
    </div>
  );
}
