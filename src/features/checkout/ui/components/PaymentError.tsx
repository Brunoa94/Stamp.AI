import { AlertCircle, Info, RefreshCw } from "lucide-react";
import Link from "next/link";

import { AlternativePaymentMethods } from ".//AlternativePaymentMethods";
import { PaymentResultDetailsGrid } from ".//PaymentResultDetailsGrid";
import { Button } from "@/features/ui/button";
import { PageDividers } from "@/features/ui/page-dividers";
import { paymentErrorTheme } from "@/theme/components";
import type {
  PaymentAlternativeMethodT,
  PaymentErrorDetailsI,
} from "@/types/payment";

interface Props {
  details: PaymentErrorDetailsI | null;
  onTryAgain: () => void;
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

const PaymentError = ({ details, onTryAgain, onSelectMethod }: Props) => {
  const isPostPaymentError = details?.isPostPaymentError ?? false;

  const reasonMessage =
    details?.reasonMessage ||
    "Your transaction couldn't be completed. Please retry or choose an alternative method.";

  const title = isPostPaymentError
    ? "Order Processing Issue"
    : "Payment Failed";

  const subtitle = isPostPaymentError
    ? "Your payment was successful, but we encountered an issue processing your order. Our team has been notified and will assist you shortly."
    : "Your transaction couldn't be completed. Don't worry, your design has been saved and is ready for retry.";

  return (
    <div className={paymentErrorTheme.page}>
      <PageDividers />

      <div className={paymentErrorTheme.wrapper}>
        <section className={paymentErrorTheme.card} aria-label="Payment failed">
          <div className={paymentErrorTheme.topAccent} aria-hidden="true" />

          <div className={paymentErrorTheme.iconWrapper} aria-hidden="true">
            <AlertCircle className={paymentErrorTheme.icon} />
          </div>

          <h1 className={paymentErrorTheme.title}>{title}</h1>
          <p className={paymentErrorTheme.subtitle}>
            {subtitle}
          </p>

          <div className={paymentErrorTheme.reasonCard}>
            <div className={paymentErrorTheme.reasonRow}>
              <Info className={paymentErrorTheme.reasonIcon} />
              <div>
                <span className={paymentErrorTheme.reasonLabel}>
                  {details?.reasonTitle ?? "Reason"}
                </span>
                <p className={paymentErrorTheme.reasonText}>{reasonMessage}</p>
              </div>
            </div>
          </div>

          <PaymentResultDetailsGrid
            items={[
              { label: "Order Number", value: details?.orderNumber ?? "—" },
              { label: "Amount Due", value: details?.amountDue ?? "—" },
              {
                label: "Attempted On",
                value: details?.attemptedOn ?? "—",
                valueMuted: true,
              },
            ]}
            statusLabel="Status"
            statusValue={details?.status ?? "Failed"}
            statusVariant="error"
          />

          <div className={paymentErrorTheme.ctaStack}>
            {!isPostPaymentError && (
              <Button
                onClick={onTryAgain}
                className={paymentErrorTheme.primaryBtn}
              >
                Retry Payment <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className={paymentErrorTheme.secondaryBtn}
            >
              <Link href="/dashboard">Cancel &amp; Go to Dashboard</Link>
            </Button>

            {!isPostPaymentError && (
              <AlternativePaymentMethods onSelectMethod={onSelectMethod} />
            )}

            <Link href="/profile" className={paymentErrorTheme.supportLink}>
              Need help? Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentError;
