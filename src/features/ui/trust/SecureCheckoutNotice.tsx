import { BadgeCheck, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { List } from "@/features/ui/list";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { ACCEPTED_PAYMENT_LOGOS } from "@/shared/constants/paymentLogos";
import { PaymentLogo } from "./PaymentLogo";

/**
 * SecureCheckoutNotice
 *
 * Payment-trust panel for the checkout, in the luxury card treatment: a
 * chocolate shield seal with the headline, three plain assurances about how
 * the payment is handled, and a cream "we accept" strip with the full-colour
 * logos of every method we take (cards via Stripe, PayPal, iDEAL via Mollie).
 */

interface SecureCheckoutNoticeProps {
  className?: string;
}

export function SecureCheckoutNotice({ className }: SecureCheckoutNoticeProps) {
  const t = useTranslations("trust.payment");
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative overflow-hidden border-2 border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) shadow-(--shadow-stamp-card)",
        className
      )}
    >
      <div className="h-1 w-full bg-(--color-stamp-gold)" aria-hidden="true" />

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        {/* Seal + headline */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-(--color-stamp-chocolate)">
            <ShieldCheck className="h-6 w-6 text-(--color-stamp-gold-light)" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <Heading
              as="h3"
              variant="cardCompact"
              className="text-(--color-stamp-chocolate)"
            >
              <span id={titleId}>{t("title")}</span>
            </Heading>
            <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
              {t("body")}
            </Paragraph>
          </div>
        </div>

        {/* Assurances */}
        <List className="grid gap-3 border-t border-(--color-stamp-divider) pt-5 sm:grid-cols-3">
          <li className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-(--color-stamp-success)" aria-hidden="true" />
            <Span variant="micro" className="font-bold text-(--color-stamp-chocolate)">
              {t("encryptedTransmission")}
            </Span>
          </li>
          <li className="flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 shrink-0 text-(--color-stamp-success)" aria-hidden="true" />
            <Span variant="micro" className="font-bold text-(--color-stamp-chocolate)">
              {t("noCardStored")}
            </Span>
          </li>
          <li className="flex items-center gap-2.5">
            <BadgeCheck className="h-4 w-4 shrink-0 text-(--color-stamp-success)" aria-hidden="true" />
            <Span variant="micro" className="font-bold text-(--color-stamp-chocolate)">
              {t("pciCompliant")}
            </Span>
          </li>
        </List>
      </div>

      {/* Accepted methods */}
      <div className="flex flex-col gap-3 border-t border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Span variant="micro" className="font-bold tracking-[0.2em] text-(--color-stamp-taupe)">
          {t("accept")}
        </Span>
        <List className="flex flex-wrap items-center gap-2">
          {ACCEPTED_PAYMENT_LOGOS.map((logo) => (
            <li key={logo.id}>
              <PaymentLogo logo={logo} />
            </li>
          ))}
        </List>
      </div>
    </section>
  );
}
