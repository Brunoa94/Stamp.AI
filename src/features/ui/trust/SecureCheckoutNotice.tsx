import { Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

/**
 * SecureCheckoutNotice
 *
 * Payment-trust panel for the checkout. States plainly how payment is handled
 * (Stripe / PayPal, no card details stored) and displays security badges.
 */

// All of these are supported by Stripe: Visa/Mastercard/Amex as card
// networks, PayPal and iDEAL as Stripe payment methods (iDEAL integration
// planned — shown here as an accepted method ahead of it).
const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "PayPal", "iDEAL"];

interface SecureCheckoutNoticeProps {
  className?: string;
}

export function SecureCheckoutNotice({ className }: SecureCheckoutNoticeProps) {
  const t = useTranslations("trust.payment");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 p-5",
        className
      )}
    >
      {/* Security Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-stamp-success)/10">
          <ShieldCheck className="h-5 w-5 text-(--color-stamp-success)" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-(--color-stamp-chocolate)">
            <Lock className="h-3.5 w-3.5 text-(--color-stamp-gold)" aria-hidden="true" />
            <Span variant="sm" className="font-bold">{t("title")}</Span>
          </div>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {t("body")}
          </Paragraph>
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center gap-3 border-t border-(--color-stamp-divider) pt-4">
        <Span
          variant="micro"
          className="border border-(--color-stamp-divider) bg-(--color-stamp-white) px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#635BFF]"
        >
          Stripe
        </Span>
        <div className="h-4 w-px bg-(--color-stamp-divider)" />
        <Span
          variant="micro"
          className="text-[9px] tracking-wider text-(--color-stamp-taupe)"
        >
          {t("sslSecured")}
        </Span>
      </div>

      {/* Payment Methods */}
      <div className="flex flex-wrap items-center gap-2">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("accept")}
        </Span>
        {PAYMENT_METHODS.map((method) => (
          <Span
            key={method}
            variant="micro"
            className="border border-(--color-stamp-divider) bg-(--color-stamp-white) px-2 py-1 text-[10px] font-bold tracking-widest text-(--color-stamp-chocolate)"
          >
            {method}
          </Span>
        ))}
      </div>
    </div>
  );
}
