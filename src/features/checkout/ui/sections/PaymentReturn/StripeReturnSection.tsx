"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PaymentError from "../../components/PaymentError";
import { PaymentReturnErrorCard } from "../../components/PaymentReturn/PaymentReturnErrorCard";
import { PaymentReturnProcessingCard } from "../../components/PaymentReturn/PaymentReturnProcessingCard";
import PaymentSuccess from "../../PaymentSuccess/PaymentSuccess";
import { PAYMENT_RETURN_ROUTES } from "@/features/checkout/lib/constants/paymentReturn";
import { useStripeReturn } from "@/features/checkout/lib/hooks/useStripeReturn";
import {
  mapPaymentFailureDetails,
  mapPaymentSuccessDetails,
} from "@/features/checkout/lib/mappers/paymentReturnDetailsMapper";

export function StripeReturnSection() {
  const t = useTranslations("checkout.returns.stripe");
  const router = useRouter();
  const { status, paymentId, orderNumber, errorMessage } = useStripeReturn();

  const handleRetry = () => router.push(PAYMENT_RETURN_ROUTES.checkout);
  const handleCreateAnother = () =>
    router.push(PAYMENT_RETURN_ROUTES.createAnother);

  switch (status) {
    case "loading":
    case "processing": {
      const isProcessing = status === "processing";
      return (
        <PaymentReturnProcessingCard
          ariaLabel={t("processingAria")}
          title={isProcessing ? t("completingTitle") : t("processingTitle")}
          description={
            isProcessing ? t("completingMessage") : t("processingMessage")
          }
        />
      );
    }
    case "success":
      return (
        <PaymentSuccess
          details={mapPaymentSuccessDetails({
            provider: "stripe",
            id: paymentId,
            paymentId,
            orderNumber,
            status: "succeeded",
            totalPaid: t("totalPaid"),
            estimatedDelivery: t("estimatedDelivery"),
          })}
          onCreateAnother={handleCreateAnother}
        />
      );
    case "failed":
      return (
        <PaymentError
          details={mapPaymentFailureDetails({
            provider: "stripe",
            paymentId,
            status: t("declinedStatus"),
            reasonTitle: t("paymentDeclinedTitle"),
            reasonMessage: errorMessage || t("paymentDeclinedMessage"),
          })}
          onTryAgain={handleRetry}
          onSelectMethod={handleRetry}
        />
      );
    default:
      return (
        <PaymentReturnErrorCard
          ariaLabel={t("errorAria")}
          title={t("somethingWentWrongTitle")}
          description={errorMessage || t("somethingWentWrongMessage")}
          retryLabel={t("returnToCheckout")}
          dashboardLabel={t("goToDashboard")}
          onRetry={handleRetry}
        />
      );
  }
}
