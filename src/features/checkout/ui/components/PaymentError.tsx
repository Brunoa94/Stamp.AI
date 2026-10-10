import { AlertCircle, Info, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { AlternativePaymentMethods } from "./AlternativePaymentMethods";
import { PaymentResultCard } from "./PaymentResultCard";
import { PaymentResultHeading } from "./PaymentResultHeading";
import { PaymentResultDetailsGrid } from "./PaymentResultDetailsGrid";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type {
  PaymentAlternativeMethodT,
  PaymentErrorDetailsI,
} from "@/shared/types/payment";

interface Props {
  details: PaymentErrorDetailsI | null;
  onTryAgain: () => void;
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

const PaymentError = ({ details, onTryAgain, onSelectMethod }: Props) => {
  const t = useTranslations("checkout.paymentError");
  const isPostPaymentError = details?.isPostPaymentError ?? false;

  const reasonMessage = details?.reasonMessage || t("reasonMessageFallback");

  const title = isPostPaymentError ? t("titlePostPayment") : t("titleDefault");

  const subtitle = isPostPaymentError
    ? t("subtitlePostPayment")
    : t("subtitleDefault");

  return (
    <PaymentResultCard
      ariaLabel={t("ariaLabel")}
      tone="error"
      icon={<AlertCircle className="w-12 h-12" />}
    >
      <PaymentResultHeading
        title={title}
        description={subtitle}
        className="mb-12"
      />

      {/* Reason card */}
      <div className="text-left bg-(--color-stamp-cream)/50 p-6 mb-12 border border-(--color-stamp-error)/20">
        <div className="flex items-start gap-3">
          <Info className="text-(--color-stamp-error) mt-1 w-4 h-4 shrink-0" />
          <div>
            <Span
              variant="micro"
              className="text-(--color-stamp-error) block mb-1"
            >
              {details?.reasonTitle ?? t("reasonFallback")}
            </Span>
            <Paragraph
              variant="sm"
              unstyled
              className="text-sm text-(--color-stamp-chocolate) font-medium leading-relaxed"
            >
              {reasonMessage}
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <PaymentResultDetailsGrid
        items={[
          { label: t("orderNumber"), value: details?.orderNumber ?? "—" },
          { label: t("amountDue"), value: details?.amountDue ?? "—" },
          {
            label: t("attemptedOn"),
            value: details?.attemptedOn ?? "—",
            valueMuted: true,
          },
        ]}
        statusLabel={t("statusLabel")}
        statusValue={details?.status ?? t("statusFallback")}
        statusVariant="error"
      />

      {/* CTAs */}
      <div className="space-y-4">
        {!isPostPaymentError && (
          <Button onClick={onTryAgain} variant="primary" className="w-full">
            {t("retryPayment")} <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard">{t("cancelGoToDashboard")}</Link>
        </Button>

        {!isPostPaymentError && (
          <AlternativePaymentMethods onSelectMethod={onSelectMethod} />
        )}

        <Link
          href="/profile"
          className="block mt-8 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) text-xs font-bold uppercase tracking-widest transition-colors"
        >
          {t("contactSupport")}
        </Link>
      </div>
    </PaymentResultCard>
  );
};

export default PaymentError;
