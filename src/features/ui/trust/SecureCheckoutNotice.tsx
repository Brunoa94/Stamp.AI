import { EyeOff, Lock, RotateCcw, ShieldCheck } from "lucide-react";
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
  { id: "noCard", Icon: EyeOff },
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
        "overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6">
        <Span
          unstyled
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-(--color-stamp-success) text-(--color-stamp-white) sm:h-14 sm:w-14"
        >
          <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
        </Span>
        <div className="flex flex-col gap-1">
          {/* No font-body: that utility also sets font-weight 400, which would beat font-bold */}
          <Heading
            as="h3"
            unstyled
            className="text-xl font-bold tracking-tight text-(--color-stamp-chocolate) md:text-2xl"
          >
            {t("title")}
          </Heading>
          <Paragraph variant="xs" className="leading-snug text-(--color-stamp-taupe)">
            {t("body")}
          </Paragraph>
        </div>
      </div>

      <List className="grid gap-px border-y border-(--color-stamp-divider) bg-(--color-stamp-divider) sm:grid-cols-3">
        {ASSURANCES.map(({ id, Icon }) => (
          <li key={id} className="flex items-start gap-3 bg-(--color-stamp-cream) p-5">
            <Icon className="h-5 w-5 shrink-0 text-(--color-stamp-success)" aria-hidden="true" />
            <div className="flex flex-col gap-1.5">
              <Heading
                as="h4"
                unstyled
                className="text-xs font-bold uppercase leading-5 tracking-wide text-(--color-stamp-chocolate)"
              >
                {t(`assurances.${id}.title`)}
              </Heading>
              <Paragraph variant="xs" className="leading-snug text-(--color-stamp-taupe)">
                {t(`assurances.${id}.body`)}
              </Paragraph>
            </div>
          </li>
        ))}
      </List>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 sm:px-6">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("accept")}
        </Span>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {ACCEPTED_PAYMENT_LOGOS.map((logoId) => (
            <PaymentLogo key={logoId} id={logoId} className="h-8 w-11 rounded-md shadow-xs sm:h-9 sm:w-14" />
          ))}
        </div>
      </div>
    </div>
  );
}
