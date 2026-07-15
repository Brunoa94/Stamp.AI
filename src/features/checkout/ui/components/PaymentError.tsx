import { AlertCircle, Info, RefreshCw } from "lucide-react";
import Link from "next/link";

import { AlternativePaymentMethods } from "./AlternativePaymentMethods";
import { PaymentResultDetailsGrid } from "./PaymentResultDetailsGrid";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
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
    <div className="min-h-screen flex justify-center pt-32 lg:pt-40 px-6 bg-(--color-stamp-cream)">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
          aria-label="Payment failed"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 w-full h-1 bg-(--color-stamp-error)"
            aria-hidden="true"
          />

          {/* Error icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 bg-(--color-stamp-error)/10 text-(--color-stamp-error)"
            aria-hidden="true"
          >
            <AlertCircle className="w-12 h-12" />
          </div>

          {/* Heading */}
          <Heading
            as="h1"
            variant="card"
            className="text-(--color-stamp-chocolate) mb-4"
          >
            {title}
          </Heading>
          <Paragraph
            variant="sm"
            className="text-(--color-stamp-taupe) max-w-sm mx-auto mb-12"
          >
            {subtitle}
          </Paragraph>

          {/* Reason card */}
          <div className="text-left bg-(--color-stamp-cream)/50 p-6 mb-12 border border-(--color-stamp-error)/20">
            <div className="flex items-start gap-3">
              <Info className="text-(--color-stamp-error) mt-1 w-4 h-4 shrink-0" />
              <div>
                <Span
                  variant="micro"
                  className="text-(--color-stamp-error) block mb-1"
                >
                  {details?.reasonTitle ?? "Reason"}
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

          {/* CTAs */}
          <div className="space-y-4">
            {!isPostPaymentError && (
              <Button
                onClick={onTryAgain}
                className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase bg-(--color-stamp-chocolate) text-(--color-stamp-white) hover:bg-(--color-stamp-chocolate)/90 flex items-center justify-center gap-2"
              >
                Retry Payment <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)"
            >
              <Link href="/dashboard">Cancel &amp; Go to Dashboard</Link>
            </Button>

            {!isPostPaymentError && (
              <AlternativePaymentMethods onSelectMethod={onSelectMethod} />
            )}

            <Link
              href="/profile"
              className="block mt-8 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Need help? Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentError;
