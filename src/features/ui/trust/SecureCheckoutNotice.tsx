import { CreditCard, Lock, RotateCcw, ShieldCheck } from "lucide-react";
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
 * Payment-trust panel for the checkout: a shield header stating how payment
 * is handled, three short assurances (encryption, no stored card, the
 * guarantee) and the full-colour logos of every accepted brand.
 */

const ASSURANCES = [
  { id: "encrypted", Icon: Lock },
  { id: "noCard", Icon: CreditCard },
  { id: "guarantee", Icon: RotateCcw },
] as const;

interface SecureCheckoutNoticeProps {
  className?: string;
}

export function SecureCheckoutNotice({ className }: SecureCheckoutNoticeProps) {
  const t = useTranslations("trust.payment");

  return (
    <div
      className={cn(
        "border border-(--color-stamp-divider) border-l-4 border-l-(--color-stamp-success) bg-(--color-stamp-white)",
        className
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <Span
          unstyled
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-(--color-stamp-success) text-(--color-stamp-white)"
        >
          <ShieldCheck className="h-6 w-6" />
        </Span>
        <div className="flex flex-col gap-1">
          <Heading as="h3" variant="cardCompact" className="text-(--color-stamp-chocolate)">
            {t("title")}
          </Heading>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {t("body")}
          </Paragraph>
        </div>
      </div>

      <List className="grid gap-px border-y border-(--color-stamp-divider) bg-(--color-stamp-divider) sm:grid-cols-3">
        {ASSURANCES.map(({ id, Icon }) => (
          <li key={id} className="flex items-start gap-3 bg-(--color-stamp-cream)/40 p-4">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-(--color-stamp-success)" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <Span variant="sm" className="font-bold text-(--color-stamp-chocolate)">
                {t(`assurances.${id}.title`)}
              </Span>
              <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
                {t(`assurances.${id}.body`)}
              </Paragraph>
            </div>
          </li>
        ))}
      </List>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("accept")}
        </Span>
        <div className="flex flex-wrap items-center gap-1.5">
          {ACCEPTED_PAYMENT_LOGOS.map((logoId) => (
            <PaymentLogo key={logoId} id={logoId} />
          ))}
        </div>
      </div>
    </div>
  );
}
