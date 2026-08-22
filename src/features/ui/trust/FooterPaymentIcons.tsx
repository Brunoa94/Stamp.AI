import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { PAYMENT_ICONS } from "@/features/homepage/lib/constants/paymentIcons";

/**
 * FooterPaymentIcons
 *
 * Payment method icons for footer placement.
 * Shows accepted payment methods with security indicator.
 */

interface FooterPaymentIconsProps {
  className?: string;
}

export function FooterPaymentIcons({ className }: FooterPaymentIconsProps) {
  const t = useTranslations("trust.payment");

  // Filter out iDEAL since it's not live yet
  const activePaymentIcons = PAYMENT_ICONS.filter((icon) => icon.id !== "ideal");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <Lock className="h-3 w-3 text-(--color-stamp-gold)" aria-hidden="true" />
        <Span variant="micro" className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-chocolate)/60">
          {t("securePayment")}
        </Span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {activePaymentIcons.map((icon) => (
          <div
            key={icon.id}
            className="flex h-8 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-white) px-2"
          >
            <span className="[&_img]:h-5! [&_img]:w-auto!">
              {icon.icon}
            </span>
          </div>
        ))}
      </div>
      <Span variant="micro" className="text-[9px] text-(--color-stamp-chocolate)/40">
        {t("sslSecured")}
      </Span>
    </div>
  );
}
