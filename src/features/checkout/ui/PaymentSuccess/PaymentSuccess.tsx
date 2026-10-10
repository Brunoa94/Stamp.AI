import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { TrustpilotReviewButton } from "@/features/ui/trust/TrustpilotReviewButton";
import { PaymentResultCard } from "../components/PaymentResultCard";
import { PaymentResultActions } from "../components/PaymentResultActions";
import { PAYMENT_RETURN_ROUTES } from "@/features/checkout/lib/constants/paymentReturn";
import { PaymentResultHeading } from "../components/PaymentResultHeading";
import { PaymentResultDetailsGrid } from "../components/PaymentResultDetailsGrid";
import type { PaymentSuccessDetailsI } from "@/shared/types/payment";

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
    <PaymentResultCard
      ariaLabel={t("ariaLabel")}
      tone="success"
      icon={<CheckCircle2 className="w-12 h-12" />}
    >
      <PaymentResultHeading
        title={t("title")}
        description={t("description")}
        className="mb-12"
      />

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
      <PaymentResultActions>
        <Button asChild variant="primary" className="w-full">
          <Link href={PAYMENT_RETURN_ROUTES.orders}>{t("trackOrder")}</Link>
        </Button>
        <Button
          variant="secondary"
          onClick={onCreateAnother}
          className="w-full"
        >
          {t("createAnother")}
        </Button>
      </PaymentResultActions>

      {/* Trustpilot review CTA */}
      <div className="mt-8 pt-8 border-t border-(--color-stamp-divider)">
        <TrustpilotReviewButton variant="prominent" />
      </div>

      {/* Confirmation email note */}
      {confirmationEmail && (
        <Span variant="micro" className="block mt-8 text-(--color-stamp-taupe)">
          {t("confirmationEmail", { email: confirmationEmail })}
        </Span>
      )}
    </PaymentResultCard>
  );
};

export default PaymentSuccess;
