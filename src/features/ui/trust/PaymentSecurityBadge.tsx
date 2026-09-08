import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

/**
 * PaymentSecurityBadge
 *
 * Security badge for display next to payment forms in checkout.
 * Shows SSL encryption, secure payment processor badges, and trust indicators.
 */

interface PaymentSecurityBadgeProps {
  className?: string;
  variant?: "default" | "compact" | "inline";
}

export function PaymentSecurityBadge({
  className,
  variant = "default",
}: PaymentSecurityBadgeProps) {
  const t = useTranslations("trust.payment");

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 text-(--color-stamp-chocolate)/60",
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-(--color-stamp-success)" aria-hidden="true" />
          <Span variant="micro" className="text-[10px] tracking-wider">
            {t("sslSecured")}
          </Span>
        </div>
        <div className="h-3 w-px bg-(--color-stamp-divider)" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-(--color-stamp-success)" aria-hidden="true" />
          <Span variant="micro" className="text-[10px] tracking-wider">
            {t("securePayment")}
          </Span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-(--color-stamp-success)/20 bg-(--color-stamp-success)/5 px-3 py-2",
          className
        )}
      >
        <ShieldCheck className="h-4 w-4 text-(--color-stamp-success)" aria-hidden="true" />
        <div className="flex flex-col">
          <Span variant="micro" className="text-[10px] font-bold tracking-wider text-(--color-stamp-chocolate)">
            {t("securePayment")}
          </Span>
          <Span variant="micro" className="text-[9px] tracking-wider text-(--color-stamp-taupe)">
            {t("sslSecured")}
          </Span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-(--color-stamp-success)/20 bg-(--color-stamp-success)/5 p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-stamp-success)/10">
          <ShieldCheck className="h-4 w-4 text-(--color-stamp-success)" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-(--color-stamp-gold)" aria-hidden="true" />
            <Span variant="sm" className="font-bold text-(--color-stamp-chocolate)">
              {t("securePayment")}
            </Span>
          </div>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {t("sslSecured")}
          </Paragraph>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-(--color-stamp-divider) pt-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-(--color-stamp-success)" aria-hidden="true" />
          <Span variant="micro" className="text-[10px] text-(--color-stamp-chocolate)/70">
            {t("noCardStored")}
          </Span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-(--color-stamp-success)" aria-hidden="true" />
          <Span variant="micro" className="text-[10px] text-(--color-stamp-chocolate)/70">
            {t("encryptedTransmission")}
          </Span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-(--color-stamp-divider) pt-3">
        <Span
          variant="micro"
          className="border border-(--color-stamp-divider) bg-(--color-stamp-white) px-2 py-1 text-[10px] font-bold tracking-wider text-[#635BFF]"
        >
          Stripe
        </Span>
        <Span
          variant="micro"
          className="border border-(--color-stamp-divider) bg-(--color-stamp-white) px-2 py-1 text-[10px] font-bold tracking-wider text-[#003087]"
        >
          PayPal
        </Span>
      </div>
    </div>
  );
}
