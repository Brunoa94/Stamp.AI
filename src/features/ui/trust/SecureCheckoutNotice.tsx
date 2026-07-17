import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * SecureCheckoutNotice
 *
 * Payment-trust panel for the checkout. States plainly how payment is handled
 * (Stripe / PayPal, no card details stored) and lists the methods actually
 * accepted. This reflects the real integration — it is not a decorative
 * "security seal". Card-network names are shown as plain text, not logos, to
 * avoid implying endorsements or shipping third-party brand assets.
 */

const METHODS = ["Visa", "Mastercard", "American Express", "PayPal"];

interface SecureCheckoutNoticeProps {
  className?: string;
}

export function SecureCheckoutNotice({ className }: SecureCheckoutNoticeProps) {
  const t = useTranslations("trust.payment");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 text-(--color-stamp-chocolate)">
        <Lock className="h-4 w-4 text-(--color-stamp-gold)" aria-hidden="true" />
        <Span variant="sm">{t("title")}</Span>
      </div>

      <p className="text-sm text-(--color-stamp-taupe)">{t("body")}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("accept")}
        </Span>
        {METHODS.map((method) => (
          <span
            key={method}
            className="border border-(--color-stamp-divider) px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-chocolate)"
          >
            {method}
          </span>
        ))}
      </div>
    </div>
  );
}
