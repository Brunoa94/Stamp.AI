import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { PaymentResultDetailsGrid } from "../components/PaymentResultDetailsGrid";
import type { PaymentSuccessDetailsI } from "@/types/payment";

interface Props {
  details: PaymentSuccessDetailsI | null;
  onCreateAnother: () => void;
}

const PaymentSuccess = ({ details, onCreateAnother }: Props) => {
  const orderNumber = details?.orderNumber ?? "—";
  const totalPaid = details?.totalPaid ?? "—";
  const estimatedDelivery = details?.estimatedDelivery ?? "7–10 business days";
  const confirmationEmail = details?.confirmationEmail;

  return (
    <div className="min-h-screen flex justify-center pt-32 lg:pt-40 px-6 bg-(--color-stamp-cream)">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
          aria-label="Payment confirmation"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 w-full h-1 bg-(--color-stamp-success)"
            aria-hidden="true"
          />

          {/* Animated success icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 bg-(--color-stamp-success)/10 text-(--color-stamp-success)"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-12 h-12" />
          </div>

          {/* Heading */}
          <Heading
            as="h1"
            variant="card"
            className="text-(--color-stamp-chocolate) mb-4"
          >
            Order Confirmed
          </Heading>
          <Paragraph
            variant="sm"
            className="text-(--color-stamp-taupe) max-w-sm mx-auto mb-12"
          >
            Your custom masterpiece is officially in the queue. We&apos;re
            warming up the ink jets right now.
          </Paragraph>

          {/* Order details grid */}
          <PaymentResultDetailsGrid
            items={[
              { label: "Order Number", value: orderNumber },
              { label: "Estimated Delivery", value: estimatedDelivery },
              { label: "Total Paid", value: totalPaid },
            ]}
            statusLabel="Status"
            statusValue="Processing"
            statusVariant="success"
          />

          {/* CTAs */}
          <div className="flex flex-col gap-4">
            <Button
              asChild
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase bg-(--color-stamp-chocolate) text-(--color-stamp-white) hover:bg-(--color-stamp-chocolate)/90"
            >
              <Link href="/orders">Track Your Order</Link>
            </Button>
            <Button
              variant="outline"
              onClick={onCreateAnother}
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)"
            >
              Create Another Order
            </Button>
          </div>

          {/* Confirmation email note */}
          {confirmationEmail && (
            <Span
              variant="micro"
              className="block mt-12 text-(--color-stamp-taupe)"
            >
              A confirmation email has been sent to {confirmationEmail}
            </Span>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentSuccess;
