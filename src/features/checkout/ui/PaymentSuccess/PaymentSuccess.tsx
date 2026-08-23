import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { TrustpilotReviewButton } from "@/features/ui/trust/TrustpilotReviewButton";
import { PaymentResultDetailsGrid } from "../components/PaymentResultDetailsGrid";
import type { PaymentSuccessDetailsI } from "@/types/payment";

interface Props {
  details: PaymentSuccessDetailsI | null;
  onCreateAnother: () => void;
}

const PaymentSuccess = ({ details, onCreateAnother }: Props) => {
  const t = useTranslations("checkout.success");
  const orderNumber = details?.orderNumber ?? "—";
  const totalPaid = details?.totalPaid ?? "—";
  const estimatedDelivery =
    details?.estimatedDelivery ?? t("defaultEstimatedDelivery");
  const confirmationEmail = details?.confirmationEmail;

  return (
    <div className="min-h-screen flex justify-center pt-20 px-6 bg-(--color-stamp-cream)">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
          aria-label={t("ariaLabel")}
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
            {t("title")}
          </Heading>
          <Paragraph
            variant="sm"
            className="text-(--color-stamp-taupe) max-w-sm mx-auto mb-12"
          >
            {t("description")}
          </Paragraph>

          {/* Order details grid */}
          <PaymentResultDetailsGrid
            items={[
              { label: t("orderNumber"), value: orderNumber },
              { label: t("estimatedDelivery"), value: estimatedDelivery },
              { label: t("totalPaid"), value: totalPaid },
            ]}
            statusLabel={t("statusLabel")}
            statusValue={t("statusProcessing")}
            statusVariant="success"
          />

          {/* CTAs */}
          <div className="flex flex-col gap-4">
            <Button
              asChild
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase bg-(--color-stamp-chocolate) text-(--color-stamp-white) hover:bg-(--color-stamp-chocolate)/90"
            >
              <Link href="/orders">{t("trackOrder")}</Link>
            </Button>
            <Button
              variant="outline"
              onClick={onCreateAnother}
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)"
            >
              {t("createAnother")}
            </Button>
          </div>

          {/* Trustpilot review CTA */}
          <div className="mt-8 pt-8 border-t border-(--color-stamp-divider)">
            <TrustpilotReviewButton variant="prominent" />
          </div>

          {/* Confirmation email note */}
          {confirmationEmail && (
            <Span
              variant="micro"
              className="block mt-8 text-(--color-stamp-taupe)"
            >
              {t("confirmationEmail", { email: confirmationEmail })}
            </Span>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentSuccess;
